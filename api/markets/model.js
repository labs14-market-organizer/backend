const db = require('../../data/dbConfig');

module.exports = {
    find,
    findById,
    add,
    update,
    remove,
};

async function find() {
    const markets = await db('markets');
    // Map hours of operation onto markets
    const final = await markets.map(async market => {
        const operation = await db('market_days')
            .where({market_id: market.id})
        return { ...market, operation };
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
        .where({market_id: id});
    return {...market, operation};
}

function add(market) {
    let {operation, ...rest} = market;
    let resMarket;
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
                        .transacting(t);
                }
            })
            resolve({...resMarket, operation: resHours})
        } catch(err) {
            reject(err);
        }
    });
}

// This could probably be simplified
async function update(id, changes) {
    // Separate changes in hours of operation from all others
    const {operation, ...market} = changes;
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
    
    // Start transaction on the database to ensure there are no partial updates (everything succeeds or fails together)
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
                    .returning('*');
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
                        .returning('*');
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
                    .where({market_id: id});
            }
            // Destructure market object out of its wrapping array
            [updated] = updated;
            // Return market object with updated hours of operation
            return {...updated, operation: opsArr}
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
            let operation, market;
            // Wrap deletions in a transaction to avoid partial creation
            await db.transaction(async t => {
                operation = await db('market_days')
                    .where({market_id: id})
                    .del()
                    .returning('*')
                    .transacting(t);
                [market] = await db('markets')
                    .where({id})
                    .del()
                    .returning('*')
                    .transacting(t);
            })
            // If no market existed, let route handle 404
            if(!market) { resolve(market) }
            resolve({...market, operation})
        } catch(err) {
            reject(err);
        }
    });
}
