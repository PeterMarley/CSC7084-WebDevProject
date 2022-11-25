/******************************
 * 
 * Imports
 * 
 ******************************/

const { LoginResponse } = require('../../../models/authResponses.js');
const { createToken, verifyToken } = require('../../../lib/jwtHelpers.js');
const getConnection = require('../../../lib/dbConnection.js');

/******************************
 * 
 * Handler
 * 
 ******************************/

/**
 * Express middleware for processing login POST requests.
 * 
 * req.body.username and req.body.password properties are required, or a 400 status will be returned
 * 
 * If they are present this middleware will validate the username/ password combination is correct, and if it is will set a JWT cookie
 * 
 * if the `req.body.redirect` property exists, the middleware will redirect to that route, otherwise a json body will be returned
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next callback
 */
function loginHandler(req, res, next) {

  // validate post body contains required data
  if (!req.body.username || !req.body.password) {
    res.status(400).json(new LoginResponse());
    return;
  }

  // destructure post body into consts
  const { username, password } = req.body;

  // get db connection and execute function to check password is correct
  con = getConnection();
  con.query('SELECT fn_Check_Password(?,?) AS passwordCorrect', [username, password], function (error, results, fields) {
    if (error) throw error;

    const result = results[0].passwordCorrect;

    // if password correct set token cookie to jwt
    if (result) {
      token = createToken(username);
      res.cookie('token', token);
    }

    // either return a response model object or redirect to specified route if redirect property provided in request post body
    if (req.body.redirect) {
      res.redirect(req.body.redirect);
    } else {
      res.status(200).json(new LoginResponse(result));
    }
  });
  con.end(); // close connection
}

/******************************
 * 
 * Exports
 * 
 ******************************/

module.exports = loginHandler;