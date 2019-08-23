
// const generateSeeds = () => {
//   const numOfUsers = 500;
//   let arr = [];

//   for (let i = 0; i < numOfUsers; i++) {
//     const end = `${i+1}`.padStart(3,0); // pads string to always have a length of 3
//     arr.push({
//       user_id: i+1,
//       provider: 'google',
//       prov_user: `900000000000000000${end}` // can't use integer math because id is FAR larger than MAX_SAFE_INTEGER
//     });
//   }
//   return arr;
// };


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
