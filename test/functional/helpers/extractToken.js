const jwt = require('jsonwebtoken');

const extractTokenErrMsg = 'header contains no cookies';

/**
 * 
 * @param response 
 * @returns 
 */
function extractToken(response) {
  const header = response.get('set-cookie');
  if (header === undefined) throw new Error(extractTokenErrMsg);
  const arr = header[0].split(/[=|;]/).map((i) => i.trim());
  const encodedToken = arr.reduce((acc, cur) => {
    if (acc === true) return cur;
    if (cur === 'token') return true;
    return acc;
  }, false);
  return jwt.verify(encodedToken, process.env.MOODR_TOKEN_SECRET)
}

module.exports = {extractToken, extractTokenErrMsg};