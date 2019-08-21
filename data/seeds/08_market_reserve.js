exports.seed = function(knex) {
  const date0 = "2019-08-21 00:00:00+00";
  const date1 = "2019-08-24 00:00:00+00";
  const date2 = "2019-08-25 00:00:00+00";
  const reserve = [
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 1,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 2,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 3,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 4,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 5,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 6,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 7,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 8,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 9,
      paid: 1,
    },
    {
      reserve_date: date0,
      booth_id: 1,
      vendor_id: 10,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 1,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 2,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 3,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 4,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 5,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 6,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 7,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 8,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 9,
      paid: 1,
    },
    {
      reserve_date: date1,
      booth_id: 1,
      vendor_id: 10,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 2,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 3,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 4,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 5,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 6,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 7,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 8,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 9,
      paid: 1,
    },
    {
      reserve_date: date2,
      booth_id: 1,
      vendor_id: 10,
      paid: 1,
    },
  ]
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE market_reserve RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("market_reserve").insert(reserve);
      })
  );
};
