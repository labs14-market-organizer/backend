exports.seed = function(knex) {
  const days = [
    {
      market_id: 1,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 1,
      day: "monday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 1,
      day: "tuesday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 1,
      day: "wednesday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 1,
      day: "thursday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 1,
      day: "friday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 1,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
  ]
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE market_days RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("market_days").insert(days);
      })
  );
};
