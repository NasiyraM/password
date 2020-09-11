const express = require('express');
const app = express();
const promise = require('bluebird');
const portNumber = process.env.PORT || 3000;
// pg-promise initialization options:
const initOptions = {
  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise, 
};
// Database connection parameters:
const config = {
  host: 'localhost',
  port: 5432,
  database: 'password-example',
  user: 'juanmrad'
};
// Load and initialize pg-promise:
const pgp = require('pg-promise')(initOptions);
// Create the database instance:
const db = pgp(config);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.listen(portNumber, function() {
  console.log(`My API is listening on port ${portNumber}.... `);
});