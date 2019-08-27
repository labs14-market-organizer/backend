const db = require('../../db/config');

module.exports = {
  findOrCreate,
}

async function findOrCreate(provided) {
  const { email, profile_pic, ...auth } = provided; // separate email from user_auth data
  const {tkn_access, tkn_refresh, ...rest} = auth;
  let id = await db('user_auth')
    .where(rest)
    .returning('id');
  let user;
  const new_acct = !id.length;
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
  } else { // If user already exists, return user
    const result = await db('users as u')
      .select('u.*')
      .where(auth)
      .join('user_auth as ua', {'u.id': 'ua.user_id'})
      .first();
    return {...result, new_acct};
  }
}
