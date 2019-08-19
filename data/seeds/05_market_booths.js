exports.seed = function(knex) {
  const booths = [
    {
      market_id: 1,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 1,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 1,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
    {
      market_id: 2,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 2,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 2,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
    {
      market_id: 3,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 3,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 3,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
    {
      market_id: 4,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 4,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 4,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
    {
      market_id: 5,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 5,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 5,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
    {
      market_id: 6,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 6,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 6,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
    {
      market_id: 7,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 7,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 7,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
    {
      market_id: 8,
      name: "Standard Booth",
      description: "These booths do not come with electricity or a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 25,
      size: [10, 10]
    },
    {
      market_id: 8,
      name: "Booth with Electricity",
      description: "These booths come with electricity but not a water hook up. Wifi is available throughout the market",
      number: 15,
      price: 30,
      size: [10, 10]
    },
    {
      market_id: 8,
      name: "Corner Booth",
      description: "These booths come with electricity and a water hook up. Wifi is available throughout the market",
      number: 4,
      price: 30,
      size: [12, 12]
    },
  ]
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE market_booths RESTART IDENTITY CASCADE")
      .then(function() {
        return knex("market_booths").insert(booths);
      })
  );
};
