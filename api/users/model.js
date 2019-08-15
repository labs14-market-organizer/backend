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
        .orderBy('id')
        .map(async vendor => {
            const status_mkt = await db('market_vendors')
                .where({vendor_id: vendor.id})
                .returning('*')
                .orderBy('id');
            return { ...vendor, status_mkt }
        });
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
    const vdrIDs = vendors.map(vdr => vdr.id);
    const upcoming_vdr = await db('market_reserve as mr')
        .select('mr.*', 'mb.market_id')
        .join('market_booths as mb', {'mb.id': 'mr.booth_id'})
        .whereIn('mr.vendor_id', vdrIDs)
        .andWhere('mr.reserve_date', '>=', db.raw('current_date'))
    const mktIDs = markets.map(mkt => mkt.id);
    const upcoming_mkt = await db('market_booths as mb')
        .select('mb.market_id','mr.reserve_date', db.raw('sum(mb.number) as number'), db.raw('(sum(mb.number) - count(mr.id)) as available'))
        .count({reserved: 'mr.id'})
        .leftJoin(db('market_reserve')
            .where('market_reserve.reserve_date', '>=', db.raw('current_date'))
            .as('mr'),
            {'mr.booth_id': 'mb.id'}
        )
        .whereIn('mb.market_id', mktIDs)
        .groupBy('mb.market_id','mr.reserve_date')
        .orderBy('mr.reserve_date');
    return {
        ...user,
        vendors,
        markets,
        upcoming_vdr,
        upcoming_mkt
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
