import mysql from 'mysql';
import { createToken, verifyToken } from '../../lib/jwtHelpers';
import { AuthResponse } from '../../models/authResponses';
import {Request, Response, NextFunction} from 'express';

/**
 * Express middleware for processing auth checks.
 * 
 * This middleware is intended for use in a request chain. It will authenticate the users JWT then call `next()`
 * 
 * This middleware will check the JWT credential. `res.locals.authed` will be set to a boolean denoting if
 * the auth was successful
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next callback
 */
function authenticate(req: Request, res: Response, next: NextFunction) {
  let success = false;
  if (req.cookies && req.cookies.token) {
    // console.log(req.cookies.token);
    try {
      const token: any = verifyToken(req.cookies.token);
      // console.dir(token);
      if (Date.now() < token.exp) {
        success = true;
        // console.log('un from token: ' + token.username);
        res.locals.username = token.username;
        // console.log('username set');
      } else {
        res.clearCookie('token');
      }
    } catch (err) {
      res.clearCookie('token');
      if (err instanceof Error) console.log(err.message);
    }
  }
  
  res.locals.authed = success;
  next();
}

/******************************
 * 
 * Exports
 * 
 ******************************/

//module.exports = authenticate;
export default authenticate;