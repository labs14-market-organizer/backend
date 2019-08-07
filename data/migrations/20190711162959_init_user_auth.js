exports.up = function(knex) {
  return knex.schema.createTable("user_auth", users => {
    users.increments();
    users.integer("user_id")
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    users.string("provider")
      .notNullable();
    users.string("prov_user")
      .notNullable();
    users.timestamp("created_at", { useTz: true }) // use timestamps with timezones
      .notNullable()
      .defaultTo(knex.fn.now()); // default value to current time at creation
    users.timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("user_auth");
};
