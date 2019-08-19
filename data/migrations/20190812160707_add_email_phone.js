exports.up = function(knex) {
  return knex.schema.table("markets", markets => {
    markets.string('email')
    markets.string('phone')
  })
.table("vendors", vendors => {
    vendors.string('email')
    vendors.string('phone')
  })
};

exports.down = function(knex) {
    return knex.schema.table("markets", markets => {
        markets.dropColumn('email')
        markets.dropColumn('phone')
    })
        .table("vendors", vendors => {
            vendors.dropColumn('email')
            vendors.dropColumn('phone')
        })
};

    

