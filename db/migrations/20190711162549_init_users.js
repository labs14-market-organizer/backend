exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS pg_trgm')
    .createTable("users", users => {
      users.increments();
      users.string("email");
      users.timestamp("created_at", { useTz: true }) // use timestamps with timezones
        .notNullable()
        .defaultTo(knex.fn.now()); // default value to current time at creation
      users.timestamp("updated_at", { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })
}

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists("users")
    .raw('DROP EXTENSION IF EXISTS pg_trgm');
};
