exports.up = function(knex) {
    return knex.schema.createTable("markets", markets => {
      markets.increments();
      markets.integer("admin_id")
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      markets.string('name');
      markets.text('description');
      markets.string('address');
      markets.string('city');
      markets.string('state');
      markets.string('zipcode')
      markets.integer('type');
      markets.string('website');
      markets.string('facebook');
      markets.string('twitter');
      markets.string('instagram');
      markets.timestamps();
    })
   }
   exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("markets");
   };

