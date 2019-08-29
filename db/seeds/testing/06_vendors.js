exports.seed = function(knex) {
  const vendors = [
    {
      admin_id: 2,
      name: "Scott’s Tots",
      description: "The best darn tator tots in the south. We also have popcorn and lemonade.",
      items: ['Popcorn', 'Lemonade', 'Tator Tots'],
      electricity: true,
      ventilation: false,
      loud: false,
      other_special: null,
      email: "scottstots@gmail.com",
      phone: "337-555-7583",
      website: "scottstots.com",
      facebook: "facebook.com/scottstots",
      instagram: "instagram.com/scottstots",
      twitter: "twitter.com/scottstots"
    },
    {
      admin_id: 3,
      name: "Red, White, & Blooms",
      // description: "",
      items: ['Flowers'],
      electricity: true,
      ventilation: false,
      loud: false,
      other_special: null,
      email: "email@email.com",
      phone: "555-555-5555",
    },
    {
      admin_id: 4,
      name: "Mr. Beep Beep's Herbs",
      // description: "",
      items: ['Herbs'],
      electricity: true,
      ventilation: false,
      loud: false,
      other_special: null,
      email: "email@email.com",
      phone: "555-555-5555",
    }
  ]
  return (
    knex
      // Deletes ALL existing entries for users table
      .raw("TRUNCATE TABLE vendors RESTART IDENTITY CASCADE")
      // .then(function() {
      //   return knex("vendors").insert(vendors);
      // })
  );
};
