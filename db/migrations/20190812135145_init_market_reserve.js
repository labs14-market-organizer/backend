exports.up = function(knex) {
  return knex.schema.createTable("market_reserve", reserve => {
    reserve.increments();
    reserve.integer('booth_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('market_booths')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    reserve.integer('vendor_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('vendors')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    reserve.timestamp('reserve_date', {useTz: true})
      .notNullable();
    reserve.integer('paid')
      .notNullable()
      .defaultTo(0);
    reserve.timestamp("created_at", { useTz: true }) // use timestamps with timezones
      .notNullable()
      .defaultTo(knex.fn.now()); // default value to current time at creation
    reserve.timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("market_reserve");
};
