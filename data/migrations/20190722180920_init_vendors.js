exports.up = function(knex) {
    return knex.schema.createTable("vendors", vendors => {
      vendors.increments();
      vendors.integer("admin_id")
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      vendors.string('name');
      vendors.text('description');
      vendors.specificType('items', 'varchar[]') // create an array of strings
      vendors.boolean('electricity');
      vendors.boolean('ventilation');
      vendors.boolean('loud');
      vendors.text('other_special');
      vendors.string('website');
      vendors.string('facebook');
      vendors.string('twitter');
      vendors.string('instagram');
      vendors.timestamp("created_at", { useTz: true }) // use timestamps with timezones
        .notNullable()
        .defaultTo(knex.fn.now()); // default value to current time at creation
      vendors.timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })
   }
   exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("vendors");
   };