const { restart } = require('nodemon');
const getConnection = require('../../../lib/dbConnection.js');
const { RegistrationResponse } = require('../../../models/authResponses.js');

/**
 * Express middlewear that received a registration forms data, and validates it via SQL queries to the database, then calls next()
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function validateRegistrationForm(req, res, next) {

  // validate post body properties exist
  if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
    res.status(400).send(new RegistrationResponse(false, 'post body missing required fields'));
    return;
  }

  // get vars from post body & validate values
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password

  // validation here

  let errMsg = {};

  // query database to ensure username and email
  con = getConnection(true);
  con.query(
    `SELECT COUNT(username) AS usernameCount FROM tbl_user WHERE username=?;
    SELECT COUNT(email) AS emailCount FROM tbl_user WHERE email=?`, [username, email], function (error, results, fields) {
    if (error) throw error;

    const usernameCount = results[0][0].usernameCount;
    const emailCount = results[1][0].emailCount;
    
    // check if username and email are unique
    if (usernameCount != 0) {
      errMsg.username = 'this username is already taken';
    } 
    if (emailCount != 0) {
      errMsg.email = 'this email is already taken';
    }

    if (Object.keys(errMsg).length === 0) {
      res.locals.success = true;
      res.locals.user = {username,email, password};
    } else {
      res.locals.success = false;
      res.locals.errors = errMsg;
    }

    next();
  });
  con.end(); // close connection
}

/**
 * Express middle wear that will register a user in the database then call next(). Dumb method, will not attempt to validate the users details
 */
function register(req, res, next) {
  if (res.locals.success && res.locals.success === true) {
    // console.log('register logic here');
    // console.dir(res.locals.user);
    const {username, password, email} = res.locals.user;
    con = getConnection();
    con.query('INSERT INTO tbl_user (username, password, email) VALUES (?,fn_1WayEncrypt(?,NULL),?)', [username, password, email], function (error, results, fields) {
      if (error) throw error;
      // console.dir(results);
    });
  } else {
    // console.dir(res.locals.errors);
  }
  next();
}

function validateUsername(con, username) {
  
}

module.exports = {validateRegistrationForm, register};