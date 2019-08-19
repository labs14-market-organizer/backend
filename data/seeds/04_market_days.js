exports.seed = function(knex) {
  const days = [
    {
      market_id: 1,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 1,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 1,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 2,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 2,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 2,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 3,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 3,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 3,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 4,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 4,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 4,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 5,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 5,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 5,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 6,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 6,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 6,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 7,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 7,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 7,
      day: "sunday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 8,
      day: "wednesday",
      start: "17:00",
      end: "20:30"
    },
    {
      market_id: 8,
      day: "saturday",
      start: "06:00",
      end: "14:00"
    },
    {
      market_id: 8,
      day: "sunday",
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
