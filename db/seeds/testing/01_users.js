const generateSeeds = () => {
  const numOfUsers = 10;
  let arr = [];
  for (let i = 0; i < numOfUsers; i++) {
    arr.push({
      email: `user${i+1}@email.com`
    });
  }
  return arr;
};

exports.seed = async function(knex, Promise) {
  const users = await generateSeeds();

  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("users").insert(users);
      })
  );
};