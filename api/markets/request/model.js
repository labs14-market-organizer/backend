const db = require('../../../db/config');

module.exports = {
  addRequest,
  updateRequest,
  removeRequest,
}

async function addRequest(request) {
  const [result] = await db('market_vendors')
      .insert(request)
      .returning('*');
  if(!result) {
      return {result}
  }
  const [market] = await db('markets as m')
      .select('u.email', 'm.name')
      .join('users as u', {'u.id': 'm.admin_id'})
      .where({'m.id': result.market_id});
  const [vendor] = await db('vendors as v')
      .select('u.email', 'v.name')
      .join('users as u', {'u.id': 'v.admin_id'})
      .where({'v.id': result.vendor_id});
  return {market, vendor, result};
}

async function updateRequest(id, changes) {
  const [result] = await db('market_vendors')
      .where({id})
      .update(changes)
      .returning('*')
  if(!result) {
      return {result}
  }
  const [market] = await db('markets as m')
      .select('u.email', 'm.name')
      .join('users as u', {'u.id': 'm.admin_id'})
      .where({'m.id': result.market_id});
  const [vendor] = await db('vendors as v')
      .select('u.email', 'v.name')
      .join('users as u', {'u.id': 'v.admin_id'})
      .where({'v.id': result.vendor_id});
  return {market, vendor, result};
}

async function removeRequest(id) {
  const [result] = await db('market_vendors')
      .where({id})
      .del()
      .returning('*');
  if(!result) {
      return {result}
  }
  const [market] = await db('markets as m')
      .select('u.email', 'm.name')
      .join('users as u', {'u.id': 'm.admin_id'})
      .where({'m.id': result.market_id});
  const [vendor] = await db('vendors as v')
      .select('u.email', 'v.name')
      .join('users as u', {'u.id': 'v.admin_id'})
      .where({'v.id': result.vendor_id});
  return {market, vendor, result};
}
