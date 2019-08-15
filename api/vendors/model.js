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
  return new Promise(async (resolve, reject) => {
      try{
          // Wrap deletions in a transaction to avoid partial creation
          await db.transaction(async t => {
              await db('market_reserve')
                  .where({'vendor_id': id})
                  .del()
                  .transacting(t);
              await db('market_vendors')
                  .where({'vendor_id': id})
                  .del()
                  .transacting(t);
              vendor = await db('vendors')
                  .where({id})
                  .del()
                  .returning('*')
                  .transacting(t);
          })
          resolve(vendor)
      } catch(err) {
          reject(err);
      }
  });
}
