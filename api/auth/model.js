const db = require('../../db/config');

module.exports = {
  findOrCreate,
}

async function findOrCreate(provided) {
  const { email, profile_pic, ...auth } = provided; // separate email from user_auth data
  const {tkn_access, tkn_refresh, ...rest} = auth;
  let [id] = await db('user_auth')
    .where(rest)
    .pluck('id');
  let user;
  const new_acct = !id;
  if(new_acct) { // Check if a user doesn't exist w/ specified auth data
    // Use a transaction to prevent partial inserts
    return new Promise(async (resolve, reject) => {
      try{
        await db.transaction(async t => {
          [user] = await db('users')
            .insert({email, profile_pic})
            .returning('*')
            .transacting(t);
          await db('user_auth')
            .insert({ ...auth, user_id: user.id })
            .transacting(t);
        });
        resolve({...user, new_acct})
      } catch(err) {
        reject(err);
      }
    })
  } else {
    // Use a transaction to prevent partial inserts
    return new Promise(async (resolve, reject) => {
      try{
        const updated_at = new Date();
        await db.transaction(async t => {
          [result] = await db('user_auth')
            .update({...auth, updated_at})
            .where(rest)
            .returning('*')
            .transacting(t);
          [user] = await db('users')
            .update({email, profile_pic, updated_at})
            .where({id})
            .returning('*')
            .transacting(t);
        });
        resolve({...user, new_acct})
      } catch(err) {
        reject(err);
      }
    })
  }
}
