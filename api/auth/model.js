const db = require('../../data/dbConfig');

module.exports = {
  google,
}

async function google(provided) {
  const { email, ...auth } = provided;
  let user;
  let id = await db('user_auth')
    .where(auth)
    .returning('id');
  if(!id.length) {
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
  } else {
    const rtrn = await db('users')
      .where({email})
      .returning('*');
    return rtrn[0];
  }
}
