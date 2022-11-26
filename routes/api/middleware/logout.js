
/**
 * Clears a users jwt token, effectively logging them out
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function logout(req, res, next) {
  res.clearCookie('token');
  next();
}

module.exports = logout;