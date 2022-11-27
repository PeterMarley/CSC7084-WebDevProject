const { LoginResponse } = require('../../models/authResponses.js');
const { createToken, verifyToken } = require('../../lib/jwtHelpers.js');
const getConnection = require('../../lib/dbConnection.js');

/**
 * Express middleware for processing login POST requests.
 * 
 * `req.body.username` and `req.body.password` properties are required, or a 400 status will be returned
 * 
 * If they are present this middleware will validate the username/ password combination is correct, and if it is will set a JWT cookie and call next()
 */
function login(req, res, next) {

  const err = validateLoginRequest(req);
  if (err.length != 0) {
    res.status(400).json(new LoginResponse(err));
    return;
  }

  // destructure post body into consts
  const { username, password } = req.body;

  // get db connection and execute function to check password is correct
  con = getConnection();
  con.query('SELECT fn_Check_Password(?,?) AS passwordCorrect', [username, password], function (error, results, fields) {
    if (error) throw error;

    const result = results[0].passwordCorrect;

    // if password correct set token cookie to jwt and set express local var to username
    if (result) {
      // console.log('username from login(): ' + username);
      res.locals.username = username;
      res.cookie('token', createToken(username));
    }

    // either return a response model object or redirect to specified route if redirect property provided in request post body
    next();
  });
  con.end(); // close connection
}

function validateLoginRequest(req, res) {
  const err = [];
  // validate post body properties and http request method
  if (req.method != 'POST') {
    err.push('login requires a POST HTTP request but was ' + req.method + '.');
  }
  if (!req.body.username) {
    err.push('login requires a POST body "username" property.');
  }
  if (!req.body.password) {
    err.push('login requires a POST body "password" property.');
  }

  return err;
}

module.exports = login;
module.exports.validateLoginRequest = validateLoginRequest;