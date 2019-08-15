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
    const upcoming_mkt = await db(
        db('market_booths as mb1')
            .select('mb1.market_id',db.raw('sum(mb1.number) as number'))
            .whereIn('mb1.market_id', mktIDs)
            .groupBy('mb1.market_id')
            .as('mb1')
        )
        .select('mb1.*','mb2.*',db.raw('(mb1.number - mb2.reserved) as available'))
        .join(
            db('market_booths as mb2')
                .select('mb2.market_id','mr.reserve_date')
                .count({reserved: 'mr.id'})
                .join(db('market_reserve as mr')
                    .where('mr.reserve_date', '>=', db.raw('current_date'))
                    .as('mr'),
                    {'mr.booth_id': 'mb2.id'}
                )
                .whereIn('mb2.market_id', mktIDs)
                .groupBy(['mb2.market_id','mr.reserve_date'])
                .as('mb2'),
            'mb1.market_id','mb2.market_id'
        )
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
