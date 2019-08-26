exports.seed = async function(knex, Promise) {
  // const users = await generateSeeds();
  const users = [
    {
      user_id: 1,
      provider: "google",
      prov_user: "104543311001294028046"
    },
    {
      user_id: 2,
      provider: "facebook",
      prov_user: "106978290647581"
    },
    {
      user_id: 3,
      provider: "square",
      prov_user: "NPA8J7QE35NJ0"
    }
  ]

  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE user_auth RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("user_auth").insert(users);
      })
  );
};
