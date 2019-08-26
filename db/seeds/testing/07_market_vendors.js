exports.seed = function(knex) {
  const request = [
    {
      market_id: 1,
      vendor_id: 1,
      status: 1,
    },
    {
      market_id: 1,
      vendor_id: 2,
      status: 0,
    },
    {
      market_id: 1,
      vendor_id: 3,
      status: -1,
    },
  ]
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE market_vendors RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("market_vendors").insert(request);
      })
  );
};
