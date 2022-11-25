const jwt = require('jsonwebtoken');

function createToken(username) {
  data = {
    expiry: Date.now() + (1000 * 60 * 60), // 1 HOUR
    username
  }
  return jwt.sign(data, process.env.MOODR_TOKEN_SECRET);
}

function verifyToken(token) {
  return jwt.verify(token, process.env.MOODR_TOKEN_SECRET)
}

module.exports = {createToken, verifyToken};