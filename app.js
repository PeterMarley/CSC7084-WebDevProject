/******************************
 * 
 * Express Config
 * 
 ******************************/

const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');

const port = 3000;



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(port, () => {
  console.log('Moodr listening on port ' + port);
});

/******************************
 * 
 * Middlewear
 * 
 ******************************/

const authRouter = require('./routes/api/authRouter.js');
const authenticate = require('./routes/api/middleware/authHandler.js');

app.use(express.static('public'));
app.use(cookieParser());
app.use(authenticate);
app.use(function debugPrint(req, res, next) {
  console.log('-------------START--------------');
  console.log('LOCALS:');
  console.dir(res.locals ? res.locals : 'no locals');
  console.log('--------------END---------------');

  console.log('-------------START--------------');
  console.log('COOKIES:');
  console.dir(req.cookies ? req.cookies : 'no cookies');
  console.log('--------------END---------------');

  next();
});

/******************************
 * 
 * Routers/ APIs
 * 
 ******************************/

app.use('/auth', authRouter); // auth api

/******************************
 * 
 * Routes
 * 
 ******************************/

app.get('/', (req, res) => {
  res.render('welcome');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});