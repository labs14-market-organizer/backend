exports.seed = function(knex) {
  const date = "2019-08-28 00:00:00+00";
  
  const reserve = [
    {
      reserve_date: date,
      booth_id: 1,
      vendor_id: 1,
      paid: 0,
    }
  ]
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE market_reserve RESTART IDENTITY CASCADE")
      // .then(function() {
      //   return knex("market_reserve").insert(reserve);
      // })
  );
};
