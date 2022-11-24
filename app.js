/******************************
 * 
 * Express Config
 * 
 ******************************/

const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


/******************************
 * 
 * Middlewear
 * 
 ******************************/

app.use(express.static('public'));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

/******************************
 * 
 * routes
 * 
 ******************************/

app.get('/', (request, response) => {
  response.send('yo');
});

app.listen(port, () => {
  console.log('Moodr listening on port ' + port);
});