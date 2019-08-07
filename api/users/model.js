const db = require('../../data/dbConfig');

module.exports = {
    find,
    findById,
    add,
    update,
    remove,
};

function find() {
    return db('users as u')
        .join('user_auth as ua', {'u.id': 'ua.user_id'})
        .select('u.id', 'u.email', 'ua.provider', 'ua.prov_user');
    }
    
    function findById(id) {
    return db('users as u')
        .select('u.id', 'u.email', 'ua.provider', 'ua.prov_user')
        .where({'u.id': id})
        .join('user_auth as ua', {'u.id': 'ua.user_id'})
        .first();
}

function add(users) {
    return db('users')
        .insert(users)
        .then(([id]) => {
            return findById(id)
        })
}

function update() {
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

function remove() {
    return db('users')
        .where(id)
        .del();
}
