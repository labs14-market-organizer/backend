const {getStateCodeByStateName: stateCode} = require("us-state-codes");
const db = require('../../data/dbConfig');

module.exports = {
    find,
    search,
    findById,
    add,
    update,
    remove,
    addRequest,
    updateRequest,
    removeRequest,
    addBooth,
    updateBooth,
    removeBooth,
    addReserve,
    updateReserve,
    removeReserve
};

async function find() {
    const markets = await db('markets').orderBy('id');
    // Map hours of operation and booths onto markets
    const final = await markets.map(async market => {
        const operation = await db('market_days')
            .where({market_id: market.id})
            .returning('*')
            .orderBy('id');
        const booths = await db('market_booths')
            .where({market_id: market.id})
            .returning('*')
            .orderBy('id');
        return { ...market, operation, booths };
    })
    // Return after all DB queries finish
    return Promise.all(final);
}

//searches city, state and zipcode by search query
async function search(query) {
    // Filter out unspecified fields
    query = Object.entries(query).filter(pair => pair[1] !== null);
    // Create similarity scores to order by
    const similar = query.map(pair => {
            // Coalesce null values to 0.01
            const basic = `coalesce(word_similarity(${pair[0]}, '${pair[1]}'), 0.01)`;
            // Weigh columns differently
            switch(pair[0]) {
                case 'state':
                    return `(${basic} * 0.01)`;
                case 'zipcode':
                    return `(${basic} * 0.1)`;
                default:
                    return basic;
            }
        })
        // Add each similarity score together
        .join(' + ');
    const markets = await db('markets')
        .where(builder => {
            // Create query builder on available fields
            query.forEach(pair => {
                // Compare case-insensitive values set in parseQueryAddr middleware
                builder.orWhereRaw(`'${pair[1]}' <% ${pair[0]}`)
            })
        })
        .returning('*')
        .orderByRaw(`${similar} DESC, id`);
    // Map hours of operation and booths onto markets
    const final = await markets.map(async market => {
        const operation = await db('market_days')
            .where({market_id: market.id})
            .returning('*')
            .orderBy('id');
        const booths = await db('market_booths')
            .where({market_id: market.id})
            .returning('*')
            .orderBy('id');
        return { ...market, operation, booths };
    })
    // Return after all DB queries finish
    return Promise.all(final);
}

async function findById(id) {
    const [market] = await db('markets')
        .where({id});
    // If the market doesn't exist return empty result to trigger 404
    if(!market) { return market };
    operation = await db('market_days')
        .where({market_id: id})
        .returning('*')
        .orderBy('id');
    booths = await db('market_booths')
        .where({market_id: id})
        .returning('*')
        .orderBy('id');
    return {...market, operation, booths};
}

function add(market) {
    let {operation, booths, ...rest} = market;
    // Coerce state into short form if it isn't already
    if(!!rest.state && rest.state.length > 2) {
        rest.state = stateCode(rest.state);
    }
    let resMarket, resBooths;
    let resHours = [];
    return new Promise(async (resolve, reject) => {
        try{
            // Wrap inserts in a transaction to avoid partial creation
            await db.transaction(async t => {
                [resMarket] = await db('markets')
                    .insert(rest)
                    .returning('*')
                    .transacting(t);
                if(operation && operation.length) {
                    operation = await operation.map(day => {
                        return {...day, market_id: resMarket.id}
                    })
                    resHours = await db('market_days')
                        .insert(operation)
                        .returning('*')
                        .orderBy('id')
                        .transacting(t);
                }
                resBooths = await db('market_booths')
                    .where({market_id: resMarket.id})
                    .returning('*')
                    .orderBy('id')
                    .transacting(t);
            })
            resolve({...resMarket, operation: resHours, booths: resBooths})
        } catch(err) {
            reject(err);
        }
    });
}

// This could probably be simplified
async function update(id, changes) {
    // Separate changes in hours of operation from all others
    const {operation, booths, ...market} = changes;
    // Coerce state into short form if it isn't already
    if(!!market.state && market.state.length > 2) {
        market.state = stateCode(market.state);
    }
    // Grab existing market
    const oldMarket = await findById(id);
    // If the market doesn't exist return empty result to trigger 404
    if(!oldMarket) { return oldMarket };
    // Create array of market_days entries to create, based on not having an id
    let hoursToCreate;
    if(!!operation) {
        hoursToCreate = operation.filter(day => !day.id)
            .map(day => ({...day, market_id: id}));
    }
    // Create array of IDs from existing hours of operation within market_days
    const existingOps = oldMarket.operation.map(day => day.id);
    // Create array of updates to hours of operation based on already existing ids in market_days
    let hoursToUpdate, hoursToDelete;
    if(!!operation && !!operation.length) {
        hoursToUpdate = operation.filter(day => existingOps.includes(day.id));
        // Create simple array of IDs of market_days entries that won't be deleted
        const safeOps = hoursToUpdate.map(day => day.id);
        // Create array of IDs of existing market_days entries that will no longer exist
        hoursToDelete = oldMarket.operation.reduce((days, day) => {
            return !safeOps.includes(day.id)
            ? [...days, day.id]
            : days;
        }, []);
    } else {
        // If no entries exist in changes at all, then mark all existing entries for deletion
        hoursToDelete = existingOps;
    }
    
    // Start thenable transaction on the database to ensure there are no partial updates (everything succeeds or fails together)
    const trx = await db.transaction();
    return trx('markets')
        .where({id})
        .update(market)
        .returning('*')
        .then(async updated => {
            // Create empty array that will be final 'operation' field returned to user
            let opsArr = [];
            // Only run updates on market_days if 'operation' was specified in changes
            if(!!operation) {
                // Create any market_days entries that need to be created
                if(!!hoursToCreate && !!hoursToCreate.length) {
                    const hoursCreated = await trx('market_days')
                        .insert(hoursToCreate)
                        .returning('*')
                        .orderBy('id');
                    // Push newly created entries to holding array
                    opsArr = [...opsArr,...hoursCreated];
                }
                // Update any market_days entries that need to be updated
                if(!!hoursToUpdate && !!hoursToUpdate.length) {
                    const updates = await Promise.all(hoursToUpdate.map(async day => {
                        const {id: opID, ...rest} = day;
                        const [result] = await trx('market_days')
                            .where({id: opID})
                            .update(rest)
                            .returning('*')
                            .orderBy('id');
                        return result;
                    }))
                    // Add updated entries to holding array
                    opsArr = [...opsArr,...updates]
                }
                // Delete any market_days entries that need to be deleted
                if(!!hoursToDelete && !!hoursToDelete.length) {
                    await trx('market_days')
                    .whereIn('id', hoursToDelete)
                    .del();
                }
            } else {
                opsArr = await trx('market_days')
                    .where({market_id: id})
                    .orderBy('id');
            }
            resBooths = await trx('market_booths')
                .where({market_id: id})
                .orderBy('id');
            // Destructure market object out of its wrapping array
            [updated] = updated;
            // Return market object with updated hours of operation
            return {...updated, operation: opsArr, booths: resBooths}
        })
        // Commit all updates if everything's successful
        .then(async updated => {
            await trx.commit();
            return updated;
        });
}

function remove(id) {
    return new Promise(async (resolve, reject) => {
        try{
            let booths, operation, market;
            // Wrap deletions in a transaction to avoid partial creation
            await db.transaction(async t => {
                booths = await db('market_booths')
                    .where({market_id: id})
                    .del()
                    .returning('*')
                    .orderBy('id')
                    .transacting(t);
                operation = await db('market_days')
                    .where({market_id: id})
                    .del()
                    .returning('*')
                    .orderBy('id')
                    .transacting(t);
                [market] = await db('markets')
                    .where({id})
                    .del()
                    .returning('*')
                    .transacting(t);
            })
            // If no market existed, let route handle 404
            if(!market) { resolve(market) }
            resolve({...market, operation, booths})
        } catch(err) {
            reject(err);
        }
    });
}

// Market_vendors functions
async function addRequest(request) {
    const result = await db('market_vendors')
        .insert(request)
        .returning('*');
    return result;
}

async function updateRequest(id, changes) {
    console.log('FOO')
    const result = await db('market_vendors')
        .where({id})
        .update(changes)
        .returning('*')
        // .toSQL().toNative();
    console.log('BAR')
    console.log(result)
    return result;
}

function removeRequest(id) {
    return db('market_vendors')
        .where({id})
        .del()
        .returning('*');
}

// Booth functions
async function addBooth(booth) {
    return new Promise(async (resolve, reject) => {
        try{
            let added;
            // Wrap insert and update in a transaction to prevent partial insert
            await db.transaction(async t => {
                [added] = await db('market_booths')
                    .insert(booth)
                    .returning('*')
                    .transacting(t);
                if(!!added) {
                    // Update the market's updated_at field
                    await db('markets')
                        .where({id: booth.market_id})
                        .update({updated_at: new Date()})
                        .transacting(t);
                }
            });
            if(!added) {
                // Include added booth for 404 handling
                resolve({added});
            } else {
                // Return the entire market after changes
                const market = await findById(booth.market_id);
                resolve({added, market});
            }
        } catch(err) {
            reject(err);
        }
    })
}

async function updateBooth(id, changes) {
    return new Promise(async (resolve, reject) => {
        try{
            let updated;
            // Wrap updates in a transaction to prevent partial insert
            await db.transaction(async t => {
                [updated] = await db('market_booths')
                    .where({id})
                    .update(changes)
                    .returning('*')
                    .transacting(t);
                if(!!updated) {
                    // Update the market's updated_at field
                    await db('markets')
                        .where({id: changes.market_id})
                        .update({updated_at: new Date()})
                        .transacting(t);
                }
            });
            if(!updated) {
                // Include updated booth for 404 handling
                resolve({updated});
            } else {
                // Return the entire market after changes
                const market = await findById(changes.market_id);
                resolve({updated, market});
            }
        } catch(err) {
            reject(err)
        }
    })
}

async function removeBooth(id) {
    return new Promise(async (resolve, reject) => {
        try{
            let deleted;
            // Wrap delete and update in a transaction to prevent partial insert
            await db.transaction(async t => {
                deleted = await db('market_booths')
                    .where({id})
                    .del()
                    .returning('*')
                    .transacting(t);
                [deleted] = deleted;
                // If there was something to delete, update the market's updated_at field
                if(!!deleted) {
                    await db('markets')
                        .where({id: deleted.market_id})
                        .update({updated_at: new Date()})
                        .transacting(t);
                }
            });
            if(!deleted) {
                // Include added booth for 404 handling
                resolve({deleted})
            } else {
                // Return the entire market after changes
                const market = await findById(deleted.market_id);
                resolve({deleted, market});
            }
        } catch(err) {
            reject(err)
        }
    })
}

// Market_reserve functions
async function addReserve(reserve) {
    const result = await db('market_reserve')
        .insert(reserve)
        .returning('*');
    return result;
}

function updateReserve(id, changes) {
return db('market_reserve')
    .where({id})
    .update(changes)
    .returning('*');
}

function removeReserve(id) {
return db('market_reserve')
    .where({id})
    .del()
    .returning('*');
}