const db = require('../../data/dbConfig');

module.exports = {
  find,
  findById,
  add,
  update,
  remove
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

function update(id, changes) {
  return db('vendors')
    .where({id})
    .update(changes)
    .returning('*');
}

function remove(id) {
  return db('vendors')
      .where({id})
      .del()
      .returning('*');
}
