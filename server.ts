import expressApp from './app';
require('dotenv').config();

/*
 * this file is an abstraction around app.js, that allows us to test app.js without its ports being set. to run the server normally,
 * this file is ran, not app.js
 */

const port  = 3000;

expressApp.listen(port, () => {
  console.log('Moodr listening on port ' + port);
});