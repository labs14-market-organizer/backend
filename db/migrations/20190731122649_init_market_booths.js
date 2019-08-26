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
    booths.string('name')
      .notNullable();
    booths.integer('number')
      .notNullable();
    booths.specificType('price', 'numeric(8,2)');
    booths.specificType('size', 'integer[]');
    booths.text('description');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("market_booths");
};
