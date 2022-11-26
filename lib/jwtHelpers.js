const jwt = require('jsonwebtoken');

/**
 * Create a jwt token
 * @param {string} username 
 * @param {number} id 
 * @returns 
 */
function createToken(username, id = 'not yet implemented') {
  data = {
    exp: Date.now() + (1000 * 60 * 60), // 1 HOUR
    username: username,
    id: id
  }
  return jwt.sign(data, process.env.MOODR_TOKEN_SECRET);
}

/**
 * Verify a tokens authenticity and decrypt
 * @param {string} token 
 * @returns decrypted token as an object literal
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.MOODR_TOKEN_SECRET);
}

module.exports = { createToken, verifyToken };