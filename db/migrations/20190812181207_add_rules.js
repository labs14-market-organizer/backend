exports.up = function(knex) {
    return knex.schema.table("markets", markets => {
      markets.text('rules')
    })
  };
  
  exports.down = function(knex) {
      return knex.schema.table("markets", markets => {
          markets.dropColumn('rules')
      })
  };