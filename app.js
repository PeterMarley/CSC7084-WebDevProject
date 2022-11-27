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

/******************************
 * 
 * Middlewear
 * 
 ******************************/

const authRouter = require('./routes/authRouter.js');
const authenticate = require('./routes/middleware/authenticate.js');

app.use(express.static('public'));
app.use(cookieParser());
app.use(authenticate);
// app.use(function debugPrint(req, res, next) {
//   console.log('-------------START--------------');
//   console.log('LOCALS:');
//   console.dir(res.locals ? res.locals : 'no locals');
//   console.log('--------------END---------------');

//   console.log('-------------START--------------');
//   console.log('COOKIES:');
//   console.dir(req.cookies ? req.cookies : 'no cookies');
//   console.log('--------------END---------------');

//   next();
// });

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

// 404 NOT FOUND fallback route
app.get('*', function(req, res){
  res.send('that aint no valid route SONNY JIM MBOY', 404);
});

module.exports = app;