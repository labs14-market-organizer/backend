exports.up = function(knex) {
  return knex.schema.createTable("market_booths", booths => {
    booths.increments();
    booths.integer("market_id")
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('markets')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    booths.string('type')
      .notNullable();
    booths.integer('number')
      .notNullable();
    booths.specificType('price', 'numeric');
    booths.specificType('size', 'integer[1][2]');
    booths.text('description');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("market_booths");
};
