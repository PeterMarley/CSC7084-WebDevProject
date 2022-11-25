const mysql = require('mysql');
const {createToken, verifyToken} = require('../../../lib/jwtHelpers.js');

function authenticate(req, res, next) {
  let success = false;
  if (req.cookies && req.cookies.token){
    console.log(req.cookies.token);
    token = verifyToken(req.cookies.token);
    if (Date.now() < token.expiry) {
      success = true;
    } 
  }
  res.locals.authed = success;
  next();
}

class AuthResponse {
  constructor(success) {
    this.success = success;
  }
}

module.exports = authenticate;