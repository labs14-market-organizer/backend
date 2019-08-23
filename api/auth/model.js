const db = require('../../data/dbConfig');
module.exports = {
  square,
  google,
  facebook
}
async function square(provided) {
  const { email, ...auth } = provided; // separate email from user_auth data
  let id = await db('user_auth')
    .where(auth)
    .returning('id');
  let user;
  if(!id.length) { // Check if a user doesn't exist w/ specified auth data
    // Use a transaction to prevent partial inserts
    return new Promise(async (resolve, reject) => {
      try{
        await db.transaction(async t => {
          [user] = await db('users')
            .insert({email})
            .returning('*')
            .transacting(t);
          await db('user_auth')
            .insert({ ...auth, user_id: user.id })
            .transacting(t);
        });
        resolve(user)
      } catch(err) {
        reject(err);
      }
    })
  } else { // If user already exists, return user
    const rtrn = await db('users as u')
      .select('u.*')
      .where(auth)
      .join('user_auth as ua', {'u.id': 'ua.user_id'});
    return rtrn[0];
  }
}
async function google(provided) {
  const { email, ...auth } = provided; // separate email from user_auth data
  let id = await db('user_auth')
    .where(auth)
    .returning('id');
  let user;
  if(!id.length) { // Check if a user doesn't exist w/ specified auth data
    // Use a transaction to prevent partial inserts
    return new Promise(async (resolve, reject) => {
      try{
        await db.transaction(async t => {
          [user] = await db('users')
            .insert({email})
            .returning('*')
            .transacting(t);
          await db('user_auth')
            .insert({ ...auth, user_id: user.id })
            .transacting(t);
        });
        resolve({...user, newAcct: !id.length})
      } catch(err) {
        reject(err);
      }
    })
  } else { // If user already exists, return user
    const rtrn = await db('users as u')
      .select('u.*')
      .where(auth)
      .join('user_auth as ua', {'u.id': 'ua.user_id'});
    return {...rtrn[0], newAcct: !id.length};
  }
}
async function facebook(provided) {
  const { email, ...auth } = provided; // separate email from user_auth data
  let id = await db('user_auth')
    .where(auth)
    .returning('id');
  let user;
  if(!id.length) { // Check if a user doesn't exist w/ specified auth data
    // Use a transaction to prevent partial inserts
    return new Promise(async (resolve, reject) => {
      try{
        await db.transaction(async t => {
          [user] = await db('users')
            .insert({email})
            .returning('*')
            .transacting(t);
          await db('user_auth')
            .insert({ ...auth, user_id: user.id })
            .transacting(t);
        });
        resolve({...user, newAcct: !id.length})
      } catch(err) {
        reject(err);
      }
    })
  } else { // If user already exists, return user
    const rtrn = await db('users as u')
      .select('u.*')
      .where(auth)
      .join('user_auth as ua', {'u.id': 'ua.user_id'});
    return {...rtrn[0], newAcct: !id.length};
  }
}
