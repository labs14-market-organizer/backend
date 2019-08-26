exports.up = function(knex) {
    return knex.schema
      .createTable("markets", markets => {
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
        markets.timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        markets.timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
      })
      .raw('CREATE INDEX markets_city_trgm_index ON markets USING GIN(city gin_trgm_ops)')
      .raw('CREATE INDEX markets_state_trgm_index ON markets USING GIN(state gin_trgm_ops)')
      .raw('CREATE INDEX markets_zipcode_trgm_index ON markets USING GIN(zipcode gin_trgm_ops)');
   }
   exports.down = function(knex, Promise) {
    return knex.schema
      .raw('DROP INDEX markets_city_trgm_index')
      .raw('DROP INDEX markets_state_trgm_index')
      .raw('DROP INDEX markets_zipcode_trgm_index')
      .dropTableIfExists("markets");
   };

