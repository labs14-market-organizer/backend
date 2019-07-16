
const generateSeeds = () => {
  const numOfUsers = 500;
  let arr = [];

  for (let i = 0; i < numOfUsers; i++) {
    const end = `${i}`.padStart(3,0);
    arr.push({
      user_id: i + 1,
      provider: 'google',
      prov_user: `900000000000000000${end}`
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