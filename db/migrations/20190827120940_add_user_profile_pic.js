exports.up = function(knex) {
  return knex.schema.table('users', users => {
    users.string('profile_pic');
  })
};

exports.down = function(knex) {
  return knex.schema.table('users', users => {
    users.dropColumn('profile_pic');
  })
};
