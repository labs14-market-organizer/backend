const db = require('../../data/dbConfig');

module.exports = {
    findById,
    add,
    update,
    remove,
};

async function findById(id) {
    const user = await db('users')
        .where({id})
        .first();
    const vendors = await db('vendors')
        .where({admin_id: user.id});
    const markets = await db('markets')
        .where({admin_id: user.id});
    return {
        ...user,
        vendors,
        markets
    }
}

function add(users) {
    return db('users')
        .insert(users)
        .then(([id]) => {
            return findById(id)
        })
}

function update(id, user) {
    return db('users')
        .where({ id })
        .update(changes)
        .then(count => {
            if (count > 0) {
                return findById(id)
            } else {
                return null
            }
        });
}

function remove(id) {
    return db('users')
        .where(id)
        .del();
}
