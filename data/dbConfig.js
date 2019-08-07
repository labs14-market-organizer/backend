const knex = require('knex');
const config = require('../knexfile.js');

const dbEnv = process.env.DB_ENV;

// Pass proper configuration based on environment
module.exports = knex(config[dbEnv]);
