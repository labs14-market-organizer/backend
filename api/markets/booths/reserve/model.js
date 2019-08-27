const db = require('../../../../db/config');
const {findReserveByDate} = require('../model')

module.exports = {
  addReserve,
  updateReserve,
  removeReserve,
}

async function addReserve(reserve, user_id) {
  let [result] = await db('market_reserve')
      .insert(reserve)
      .returning('*');
  if(!result) {
      return {result}
  }
  const market = await db('market_booths as mb')
      .select('mb.market_id','m.name','mb.name as booth_name','u.email')
      .join('markets as m', {'m.id': 'mb.market_id'})
      .join('users as u', {'u.id': 'm.admin_id'})
      .where({'mb.id': result.booth_id})
      .first();
  const vendor = await db('vendors as v')
      .select('v.name','u.email')
      .join('users as u', {'u.id': 'v.admin_id'})
      .where({'v.id': result.vendor_id})
      .first();
  const available = await findReserveByDate(market.market_id, result.reserve_date, user_id);
  return {market, vendor, result, available}
}

async function updateReserve(id, changes, user_id) {
  let [result] = await db('market_reserve')
      .where({id})
      .update(changes)
      .returning('*');
  if(!result) {
      return {result}
  }
  const market = await db('market_booths as mb')
      .select('mb.market_id','m.name','mb.name as booth_name','u.email')
      .join('markets as m', {'m.id': 'mb.market_id'})
      .join('users as u', {'u.id': 'm.admin_id'})
      .where({'mb.id': result.booth_id})
      .first();
  const vendor = await db('vendors as v')
      .select('v.name','u.email')
      .join('users as u', {'u.id': 'v.admin_id'})
      .where({'v.id': result.vendor_id})
      .first();
  const available = await findReserveByDate(market.market_id, result.reserve_date, user_id);
  return {market, vendor, result, available}
}

async function removeReserve(id, user_id) {
  const [result] = await db('market_reserve')
      .where({id})
      .del()
      .returning('*');
  if(!result) {
      return {result}
  }
  const market = await db('market_booths')
      .select('market_id')
      .where({id: result.booth_id})
      .first();
  const available = await findReserveByDate(market.market_id, result.reserve_date, user_id);
  return {result, available}
}