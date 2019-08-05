const db = require('../../data/dbConfig');

module.exports = {
    findById,
    // add,
    // update,
    // remove,
};

async function findById(id) {
    const user = await db('users')
        .where({id})
        .first();
    if(!user) {
        return user; // Let route handle 404s
    }
    const vendors = await db('vendors')
        .where({admin_id: user.id})
        .returning('*')
        .orderBy('id');
    let markets = await db('markets')
        .where({admin_id: user.id})
        .returning('*')
        .orderBy('id')
        .map(async market => {
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
    return {
        ...user,
        vendors,
        markets
    }
}

// function add(users) {
//     return db('users')
//         .insert(users)
//         .then(([id]) => {
//             return findById(id)
//         })
// }

// function update(id, user) {
//     return db('users')
//         .where({ id })
//         .update(changes)
//         .then(count => {
//             if (count > 0) {
//                 return findById(id)
//             } else {
//                 return null
//             }
//         });
// }

// function remove(id) {
//     return db('users')
//         .where(id)
//         .del();
// }
