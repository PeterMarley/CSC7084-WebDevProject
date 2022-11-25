const jwt = require('jsonwebtoken');

function createToken(username) {
  data = {
    // expiry: Date.now(),
    expiry: Date.now() + (1000 * 60 * 60),
    username
  }
  return jwt.sign(data, process.env.MOODR_SESSION_KEY);
}

function verifyToken(token) {
  return jwt.verify(token, process.env.MOODR_SESSION_KEY)
}

module.exports = {createToken, verifyToken};