
import {Request, Response, NextFunction} from 'express';

/**
 * Clears a users jwt token, effectively logging them out
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function logout(req: Request, res: Response, next: NextFunction) {
  res.clearCookie('token');
  next();
}

//module.exports = logout;
export default logout;