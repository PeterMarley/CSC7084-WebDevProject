const { restart } = require('nodemon');
const getConnection = require('../../../lib/dbConnection.js');
const { RegistrationResponse } = require('../../../models/authResponses.js');

function register(req, res, next) {
  con = getConnection(true);

  // validate post body
  if (!req.body || !req.body.username || !req.body.email) {
    res.status(400).send(new RegistrationResponse(false, 'post body missing required fields'));
    return;
  }

  const username = req.body.username;
  const email = req.body.email;

  con.query(
    `SELECT COUNT(username) AS usernameCount FROM tbl_user WHERE username=?;
    SELECT COUNT(email) AS emailCount FROM tbl_user WHERE email=?`, [username, email],function (error, results, fields) {
    if (error) throw error;

    const usernameCount = results[0][0].usernameCount;
    const emailCount = results[1][0].emailCount;
    
    console.log('un count: ' + usernameCount + '; email count: ' + emailCount);
    console.log(typeof usernameCount);

    let errMsg = null;
    if (usernameCount != 0) {
      errMsg = 'this username is already taken';
    } else if (emailCount != 0) {
      errMsg = 'this email is already taken';
    }

    console.log(errMsg);

    if (errMsg) {
      res.status(200).send(new RegistrationResponse(false, errMsg));
    } else {
      res.status(200).send(new RegistrationResponse(true));
    }
  });
  con.end(); // close connection
  
  
}

function validateUsername(con, username) {
  
}

module.exports = register;