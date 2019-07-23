const db = require('../../data/dbConfig');

module.exports = {
    find,
    findById,
    add,
    update,
    remove,
};

function find() {
    return db('markets as m')
        
    }
    
    function findById(id) {
    return db('markets as m')
        .where({'m.id': id})
         .first();
}

function add(markets) {
    return db('markets')
        .insert(markets)
        .returning('*')
        
    
}

function update() {
    return db('markets')
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
    return db('markets')
        .where(id)
        .del();
}
