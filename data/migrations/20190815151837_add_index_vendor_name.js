// Create trigram index on vendor name
exports.up = function(knex) {
  return knex.schema.raw('CREATE INDEX vendors_name_trgm_index ON vendors USING GIN(name gin_trgm_ops)')
};

exports.down = function(knex) {
  return knex.schema.raw('DROP INDEX vendors_name_trgm_index');
};
