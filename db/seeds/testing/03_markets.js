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
      instagram: "instagram.com/lafarmersmarket",
      rules,
    }
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
