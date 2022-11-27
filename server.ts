const app = require('./app');
const port  = 3000;

/*
 * this file is an abstraction around app.js, that allows us to test app.js without its ports being set. to run the server normally,
 * this file is ran, not app.js
 */

app.listen(port, () => {
  console.log('Moodr listening on port ' + port);
});