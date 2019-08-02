const knex = require('knex');
const config = require('../knexfile.js');

const dbEnv = process.env.NODE_ENV;

// Pass proper configuration based on environment
module.exports = knex(config[dbEnv]);
