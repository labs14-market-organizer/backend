const db = require('../../data/dbConfig');

module.exports = {
    find,
    findById,
    add,
    update,
    remove,
};

function find() {
    return db('markets')
        
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

function update(id, changes) {
    return db('markets')
      .where({ id })
      .update(changes, '*');
  }

function remove(id) {
    return db('markets')
        .where({id})
        .del()
        .returning('*');

}
