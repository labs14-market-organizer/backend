exports.up = function(knex) {
  return knex.schema.createTable("market_vendors", vendor => {
    vendor.increments();
    vendor.integer('market_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('markets')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    vendor.integer('vendor_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('vendors')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    vendor.integer('status');
    vendor.timestamp("created_at", { useTz: true }) // use timestamps with timezones
      .notNullable()
      .defaultTo(knex.fn.now()); // default value to current time at creation
    vendor.timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("market_vendors");
};
