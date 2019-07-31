exports.up = function(knex) {
  return knex.schema.createTable("market_days", days => {
    days.increments();
    days.integer("market_id")
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('markets')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    days.string('day')
      .notNullable();
    days.time('start', { useTz: false })
      .notNullable();
    days.time('end', { useTz: false })
      .notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("market_days");
};
