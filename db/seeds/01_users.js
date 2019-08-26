exports.seed = async function(knex, Promise) {
  // const users = await generateSeeds();
  const users = [
    {
      email: "cloudstandsapp@gmail.com"
    },
    {
      email: "cloudstandsapp@gmail.com"
    },
    {
      email: "cloudstandsapp@gmail.com"
    },
  ]

  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("users").insert(users);
      })
  );
};
