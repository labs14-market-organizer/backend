const generateSeeds = () => {
  const numOfUsers = 10;
  let arr = [];
  for (let i = 0; i < numOfUsers; i++) {
    const end = `${i+1}`.padStart(3,0); // pads string to always have a length of 3
    arr.push({
      user_id: i+1,
      provider: 'google',
      prov_user: `900000000000000000${end}` // can't use integer math because id is FAR larger than MAX_SAFE_INTEGER
    });
  }
  return arr;
};

exports.seed = async function(knex, Promise) {
  const users = await generateSeeds();
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE user_auth RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("user_auth").insert(users);
      })
  );
};
