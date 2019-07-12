require('dotenv').config();

// Function that accepts environment variable and returns
// object for local development/testing environments
const localPG = db => ({
  host: process.env.HOST,
  database: db, // Name of database cluster
  user: process.env.USER,
  password: process.env.PSWD
});

// Creates connection object for local test environment
const pgTest = localPG(process.env.DB_TEST);
// Creates connection object for local dev environment
const pgDev = localPG(process.env.DB_DEV);

// Function that accepts a connection object or URL
// and returns object to set up one environment
const dbSettings = (connection) => ({
  client: 'pg',
  connection, // pgTest, pgDev, or URL
  pool: {
    min: 2,
    max: 10
  },
  useNullAsDefault: true,
  migrations: {
    directory: './data/migrations'
  },
  seeds: {
    directory: `./data/seeds`
  }
});

// Configures knex for DB clusters in each environment
module.exports = {
  testing: dbSettings(pgTest),
  development: dbSettings(pgDev),
  staging: dbSettings(process.env.BE_SERVER),
  production: dbSettings(process.env.BE_SERVER)
};
