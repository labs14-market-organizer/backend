const db = require('../../data/dbConfig');

module.exports = {
  find,
  findById,
  add,
}

function find() {
  return db('vendors')
    .returning('*');
}

function findById(id) {
  return db('vendors')
    .where({id})
    .returning('*')
    .first();
}

function add(vendor) {
  return db('vendors')
    .insert(vendor)
    .returning('*');
}
