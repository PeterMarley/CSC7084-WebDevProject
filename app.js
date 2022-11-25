/******************************
 * 
 * Express Config
 * 
 ******************************/

const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = 3000;

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded({extended: false});

const authRouter = require('./routes/authRouter.js');
const dbRouter = require('./routes/api/db.js');


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

app.use('/auth', authRouter);
app.use('/db', dbRouter);

app.get('/', (request, response) => {
  response.render('index', {session});
});



