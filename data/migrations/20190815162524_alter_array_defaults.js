
exports.up = function(knex) {
  return knex.schema.table("vendors", vendors => {
    vendors.specificType('items', 'varchar[]')
      .defaultTo('{}')
      .alter();
  })
  .table("market_booths", booths => {
    booths.specificType('size', 'integer[]')
      .defaultTo('{}')
      .alter();
  })
};

exports.down = function(knex) {
  return knex.schema.table("vendors", vendors => {
    vendors.specificType('items', 'varchar[]')
      .alter();
  })
  .table("market_booths", booths => {
    booths.specificType('size', 'integer[]')
      .alter();
  })
};
