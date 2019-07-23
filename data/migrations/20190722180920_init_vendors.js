
exports.up = function(knex) {
    return knex.schema.createTable("vendors", vendors => {
      vendors.increments();
      vendors.integer("admin_id")
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      vendors.string('name');
      vendors.text('description');
      vendors.text('items');
      vendors.boolean('electricity');
      vendors.boolean('ventilation');
      vendors.boolean('loud');
      vendors.text('other_special');
      vendors.string('website');
      vendors.string('facebook');
      vendors.string('twitter');
      vendors.string('instagram');
      vendors.timestamps();
      

    })
   }
   exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("vendors");
   };