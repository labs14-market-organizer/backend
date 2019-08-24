const db = require('../../../db/config');
const {findById} = require('../model');

module.exports = {
  addBooth,
  updateBooth,
  removeBooth,
  findReserveByDate,
}

async function addBooth(booth, user_id) {
  return new Promise(async (resolve, reject) => {
      try{
          let added;
          // Wrap insert and update in a transaction to prevent partial insert
          await db.transaction(async t => {
              [added] = await db('market_booths')
                  .insert(booth)
                  .returning('*')
                  .transacting(t);
              if(!!added) {
                  // Update the market's updated_at field
                  await db('markets')
                      .where({id: booth.market_id})
                      .update({updated_at: new Date()})
                      .transacting(t);
              }
          });
          if(!added) {
              // Include added booth for 404 handling
              resolve({added});
          } else {
              // Return the entire market after changes
              const market = await findById(booth.market_id);
              resolve({added, market});
          }
      } catch(err) {
          reject(err);
      }
  })
}

async function updateBooth(id, changes, user_id) {
  return new Promise(async (resolve, reject) => {
      try{
          let updated;
          // Wrap updates in a transaction to prevent partial insert
          await db.transaction(async t => {
              [updated] = await db('market_booths')
                  .where({id})
                  .update(changes)
                  .returning('*')
                  .transacting(t);
              if(!!updated) {
                  // Update the market's updated_at field
                  await db('markets')
                      .where({id: changes.market_id})
                      .update({updated_at: new Date()})
                      .transacting(t);
              }
          });
          if(!updated) {
              // Include updated booth for 404 handling
              resolve({updated});
          } else {
              // Return the entire market after changes
              const market = await findById(changes.market_id);
              resolve({updated, market});
          }
      } catch(err) {
          reject(err)
      }
  })
}

async function removeBooth(id, user_id) {
  return new Promise(async (resolve, reject) => {
      try{
          let deleted;
          // Wrap delete and update in a transaction to prevent partial insert
          await db.transaction(async t => {
              await db('market_reserve')
                  .where({'booth_id': id})
                  .del()
                  .transacting(t);
              deleted = await db('market_booths')
                  .where({id})
                  .del()
                  .returning('*')
                  .transacting(t);
              [deleted] = deleted;
              // If there was something to delete, update the market's updated_at field
              if(!!deleted) {
                  await db('markets')
                      .where({id: deleted.market_id})
                      .update({updated_at: new Date()})
                      .transacting(t);
              }
          });
          if(!deleted) {
              // Include added booth for 404 handling
              resolve({deleted})
          } else {
              // Return the entire market after changes
              const market = await findById(deleted.market_id);
              resolve({deleted, market});
          }
      } catch(err) {
          reject(err)
      }
  })
}

async function findReserveByDate(marketID, date, user_id) {
  const booths = await db('market_booths')
      .where({market_id: marketID})
      .pluck('id');
  const result = await db('market_booths as mb')
      // "available" = available booths
      // "user_vdrs" = array of the user's vendor IDs that have reserved that booth
      .select('mb.id', 'mb.number', db.raw('(mb.number - count(mr.id)) as available'), db.raw(`ARRAY_REMOVE(ARRAY_AGG(mr.vendor_id ORDER BY mr.vendor_id) FILTER(WHERE mr.user_vdr = ${user_id}), NULL) as user_vdrs`))
      .count({reserved: 'mr.id'})
      .leftJoin(db('market_reserve')
          .select('market_reserve.id', 'market_reserve.booth_id', 'market_reserve.vendor_id', 'v.admin_id as user_vdr')
          .join('vendors as v', {'v.id': 'market_reserve.vendor_id'})
          .where({'market_reserve.reserve_date': date})
          .as('mr'),
          {'mr.booth_id': 'mb.id'}
      )
      .whereIn('mb.id', booths)
      .groupBy('mb.id')
      .orderBy('mb.id');
  return result;
}
