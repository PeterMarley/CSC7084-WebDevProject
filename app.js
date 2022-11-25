/******************************
 * 
 * Express Config
 * 
 ******************************/

const express = require('express');
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

app.get('/', (request, response) => {
  response.render('index');
});