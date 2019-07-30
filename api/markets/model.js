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

async function update(id, changes) {
    const {operation, ...market} = changes;
    const oldMarket = await findById(id);
    const hoursToCreate = operation.filter(day => !day.id)
        .map(day => ({...day, market_id: id}));
    const existingOps = oldMarket.operation.map(day => day.id);
    const hoursToUpdate = operation.filter(day => existingOps.includes(day.id));
    const safeOps = hoursToUpdate.map(day => day.id);
    const hoursToDelete = oldMarket.operation.reduce((days, day) => {
        return !safeOps.includes(day.id)
            ? [...days, day.id]
            : days;
    }, []);
    return new Promise(async (resolve, reject) => {
        let updated;
        const opsArr = [];
        try {
            await db.transaction(async t => {
                [updated] = await db('markets')
                    .where({id})
                    .update(market)
                    .returning('*')
                    .transacting(t);
                const hoursCreated = await db('market_days')
                    .insert(hoursToCreate)
                    .returning('*')
                    .transacting(t);
                opsArr.push(...hoursCreated);
                await hoursToUpdate.forEach(async day => {
                    const {id: opID, ...rest} = day;
                    const [result] = await db('market_days')
                        .where({id: opID})
                        .update(rest)
                        .returning('*')
                        .transacting(t);
                    opsArr.push(result);
                })
                await db('market_days')
                    .whereIn('id', hoursToDelete)
                    .del();
            })
            resolve({
                ...updated,
                operation: opsArr
            });
        } catch(err) {
            reject(err);
        }
    })
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
            resolve({...market, operation})
        } catch(err) {
            reject(err);
        }
    });
}
