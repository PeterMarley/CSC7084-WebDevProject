/******************************
 * 
 * Express Config
 * 
 ******************************/

const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const app = express();
const path = require('path');
const port = 3000;


const authRouter = require('./routes/api/authRouter.js');

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

app.use(express.static('public'));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: process.env.MOODR_SESSION_KEY,
  maxAge: 1000 * 60 * 60 * 24,
}));

/******************************
 * 
 * routes
 * 
 ******************************/

app.use('/auth', authRouter); // auth api

app.get('/', (request, response) => {
  response.render('index', {session});
});



