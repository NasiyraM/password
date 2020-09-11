const express = require('express');
const app = express();
const promise = require('bluebird');
const portNumber = process.env.PORT || 3000;
const session = require('express-session');
const pbkdf2 = require('pbkdf2');

// pg-promise initialization options:
const initOptions = {
  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise, 
};

// Database connection parameters:
const config = {
  host: 'localhost',
  port: 5432,
  database: 'password',
  user: 'Nasiyra'
};

// Load and initialize pg-promise:
const pgp = require('pg-promise')(initOptions);

// Create the database instance:
const db = pgp(config);

app.use(session({
  secret: process.env.SECRET_KEY || 'tacocat',
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function encryptPassword(password) {
  var key = pbkdf2.pbkdf2Sync(
    password, "la7sdycfoialwbdfalwie7f", 36000, 256, 'sha256'
  );
  return hash = key.toString('hex');
}

function authenticatedMiddleware(req, res, next) {
  // if user is authenticated let request pass
  if (req.session.user) {
    next();
  } else { // user is not authenticated send them to login
    console.log('user not authenticated');
    res.redirect('/login');
  }
}

function authorizedFinancialMiddleware(req, res, next) {
  if (req.session.user.role != 'accounting') {
    res.send('Access not authorized please contact accounting');
  } else {
    next();
  }
}

app.get('/login', function (req, res) {
  res.send('Please login');
});

app.post('/login', function (req, res) {
  if( req.body.username && req.body.password ) {
    console.log(req.body);
    let encryptedPass = encryptPassword(req.body.password);
    db.one(
      `SELECT * FROM users WHERE 
      username = '${req.body.username}' AND 
      password = '${encryptedPass}'`
      ).then(function (response) {
        console.log(response);
        
        req.session.user = response;

        res.send('worked');
      }).catch(function (error) {
        console.log(error);
        res.send('error');
      });
  } else {
    res.send('Please send a username and password');
  }
})

app.get('/sign-up', function (req, res) {
  res.send('please sign up');
});

app.post('/sign-up', function (req, res) {

  if( req.body.username && req.body.password ) {

    let encryptedPass = encryptPassword(req.body.password);
    db.query(`INSERT INTO users (username, password, role) 
    VALUES ('${req.body.username}', '${encryptedPass}', 'user')`)
    .then(function (response) {
      console.log(response);
      res.send('success');
    }).catch(function (error){
      console.log(error);
      res.send('error');
    })

  } else {
    res.send('Please send a username and password');
  }
});

app.get('/dashboard', authenticatedMiddleware, function (req, res) {
  res.send('Secret Info for: ' + req.session.user.username);
});

app.get('/financials', authenticatedMiddleware, authorizedFinancialMiddleware, function (req, res) {
  res.send('This comany has 1 million dollarz');
});

app.listen(portNumber, function() {
  console.log(`My API is listening on port ${portNumber}.... `);
});