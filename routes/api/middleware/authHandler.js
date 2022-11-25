const mysql = require('mysql');
const {createToken, verifyToken} = require('../../../lib/jwtHelpers.js');

function authenticate(req, res, next) {
  let success = false;
  if (req.cookies && req.cookies.token){
    console.log(req.cookies.token);
    token = verifyToken(req.cookies.token);
    //console.log(token);
    if (Date.now() < token.expiry) {
      success = true;
    } 
  }
  res.json(new AuthResponse(success));
}

class AuthResponse {
  constructor(success) {
    this.success = success;
  }
}

module.exports = authenticate;