exports.up = function(knex) {
  return knex.schema.table('users', users => {
    users.string('profile_pic');
  })
  .table('user_auth', user => {
    user.string('tkn_access');
    user.string('tkn_refresh');
  })
};

exports.down = function(knex) {
  return knex.schema.table('users', users => {
    users.dropColumn('profile_pic');
  })
  .table('user_auth', user => {
    user.dropColumn('tkn_access');
    user.dropColumn('tkn_refresh');
  })
};
