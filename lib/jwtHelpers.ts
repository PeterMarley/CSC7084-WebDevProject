import jwt from 'jsonwebtoken';

/**
 * Create a jwt token
 * @param {string} username 
 * @param {number} id 
 * @returns 
 */
function createToken(id: number, username: string, email: string) {
  return jwt.sign(
    {
      id,
      username,
      email,
      expiry: Date.now() + (1000 * 60 * 60)
    },
    process.env.MOODR_TOKEN_SECRET!
  );
}

/**
 * Verify a tokens authenticity and decrypt it, returning as a
 * @param {string} token 
 * @returns decrypted token as an object literal
 */
function verifyToken(token: string): string | jwt.JwtPayload {
  return jwt.verify(token, process.env.MOODR_TOKEN_SECRET!);
}

//module.exports = { createToken, verifyToken };
export { createToken, verifyToken };