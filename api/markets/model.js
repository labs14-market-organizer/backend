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

function update(id, changes) {
    return db('markets')
      .where({ id })
      .update(changes, '*');
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
