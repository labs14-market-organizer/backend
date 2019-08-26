exports.seed = function(knex) {
  const rules = "I. VENDOR ELIGIBILITY INFORMATION & REQUIREMENTS A. Producer-Only Market: • This market is a producer-only market. • All products sold must be grown or otherwise produced by the vendor. No resale is permitted. • A vendor may not sell products grown or produced by others. RULES & REGULATIONS Updated March, 2019 • Vendors warrant the quality of all his/her products when they are offered to the public. • Produce grown or products produced at a location not listed in the application are not eligible to be sold - except by cooperatives, as noted below."
  const markets = [
    {
      admin_id: 1,
      name: "Lafayette Farmers Market",
      description: "Louisiana-proud, family-owned farmers market",
      address: "131 Geno Dr.",
      city: "Lafayette",
      state: "LA",
      zipcode: "70506",
      email: "lafayettemarket@gmail.com",
      phone: "337-555-6264",
      type: 1,
      website: "lafarmersmarket.com",
      facebook: "facebook.com/lafarmersmarket",
      twitter: "twitter.com/lafarmersmarket",
      instagram: "instagram.com/lafarmersmarket"
,
rules    },
    {
      admin_id: 1,
      name: "Adams County Farmer's Market",
      description: "We are a first year market that has made a large impact! With about 10 vendors each week, we provide the community with fresh fruits, vegetables, grass-fed beef, local honey, herbs, flowers, soaps, trees, herbal teas, and baked goods! Please come out and see what Adams County has to offer!",
      address: "25 Rice Dr.",
      city: "West Union",
      state: "OH",
      email: "email@email.com",
      phone: "555-555-5555",
      zipcode: "45693",
      type: 1,
      facebook: "https://www.facebook.com/acohfarmersmarket",
      instagram: "http://instagram.com/acohfarmersmarket"
,
rules    },
    {
      admin_id: 1,
      name: "Bauman Orchards, Inc.",
      description: "Homegrown apples, peaches, strawberries, pears and other fruits and vegetables. Wholesale and retail sales. Family owned since 1929. Pick your own; open daily M-F 8am to 6pm and Sat. 8am to 5pm. Join us for our Strawberry Festival in June and our Fall Festivals the last Saturday in September and the first two Saturdays in October.",
      address: "161 Rittman Ave.",
      city: "Rittman",
      state: "OH",
      zipcode: "44270",
      email: "email@email.com",
      phone: "555-555-5555",
      type: 1,
      website: "http://www.baumanorchards.com/",
      rules
    },
    {
      admin_id: 1,
      name: "Beavercreek Farmers' Market",
      description: "Our vendors offer a variety of in-season produce, ornamental and edible plants, and baked goods.",
      address: "4051 Indian Ripple Road",
      city: "Beavercreek",
      state: "OH",
      zipcode: "45440",
      email: "email@email.com",
      phone: "555-555-5555",
      type: 1
,
rules    },
    {
      admin_id: 1,
      name: "Gahanna Farmers Market",
      description: "The market will be open every Sunday from June 2nd through September 29 from 4p.m. to 7p.m. except for June 16th. We will have children's activities, market kitchen, market sprouts kids club, weekly recipes, health checks, nutrition counseling live musicians, gardening and cooking demonstrations, and handmade artisan products.",
      address: "123 Serran Dr.",
      city: "Gahanna",
      state: "OH",
      zipcode: "43230",
      email: "email@email.com",
      phone: "555-555-5555",
      type: 1,
      website: "http://www.makegahannayours.com/",
      rules
    },
    {
      admin_id: 1,
      name: "Franklin Park Conservatory and Botanical Gardens",
      description: "Open Wednesdays, June 7 through September 6, 2017 from 3:30 - 6:30 pm in the main parking lot in front of the Franklin Park Conservatory and Botanical Gardens Farmers' Market. Shop from local farmers every week for seasonal vegetables, fruits and flowers, plants, baked goods, honey, sauces, flavored oils and vinegars, beef, pork, eggs and cheese. Enjoy cooking and wellness demonstrations, food trucks, live music and interactive kids' crafts.",
      address: "1777 E. Broad Street",
      city: "Columbus",
      state: "OH",
      zipcode: "43203",
      email: "email@email.com",
      phone: "555-555-5555",
      type: 1,
      website: "http://www.fpconservatory.org/",
      rules
    },
    {
      admin_id: 1,
      name: "Pearl Market",
      description: "Open every Tuesday and Friday from May 24th through October 11th between 10:30 AM and 2 PM. Live music every market day and cooking demonstrations once a month.",
      address: "23 N. Fourth St.",
      city: "Columbus",
      state: "OH",
      zipcode: "43215",
      email: "email@email.com",
      phone: "555-555-5555",
      type: 1,
      website: "http://pearlmarket.org/",
      rules
    },
    {
      admin_id: 1,
      name: "Battle Creek Farmers Market",
      description: "The Battle Creek Farmers Market is open on Wednesday and Saturday, May through October. The market opens at 9:00 am and closes at 1:00 pm. There is convenient and free parking, including one hour free parking for market patrons in the Hamblin Avenue parking ramp.",
      address: "25 South McCamly Street",
      city: "Battle Creek",
      state: "MI",
      zipcode: "49017",
      email: "email@email.com",
      phone: "555-555-5555",
      type: 1,
      website: "http://www.battlecreekfarmersmarket.com/",
      rules
    },
  ]
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE markets RESTART IDENTITY CASCADE")
      // .then(function() {
      //   return knex("markets").insert(markets);
      // })
  );
};
