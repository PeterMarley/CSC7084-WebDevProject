import { LoginResponse } from '../../models/authResponses';
import { createToken, verifyToken } from '../../lib/jwtHelpers';
import getConnection from '../../lib/dbConnection';
import {Request, Response, NextFunction} from 'express';
import mysql from 'mysql';

/**
 * Express middleware for processing login POST requests.
 * 
 * `req.body.username` and `req.body.password` properties are required, or a 400 status will be returned
 * 
 * If they are present this middleware will validate the username/ password combination is correct, and if it is will set a JWT cookie and call next()
 */
function login(req: Request, res: Response, next: NextFunction) {

  const err: string[] = validateLoginRequest(req, res);
  if (err.length != 0) {
    res.status(400).json(new LoginResponse(err));
    return false;
  }

  // get db connection and execute function to check password is correct
  const con = getConnection();
  checkPassword(con, 'SELECT fn_Check_Password(?,?) AS passwordCorrect', req, next, res, dbProcess);
  con.end(); // close connection
}


function checkPassword(connection: mysql.Connection, sql: string, req: Request, next: NextFunction, res: Response, dbCallback: Function) {
  const { username, password } = req.body;
  connection.query(
    sql,
    [username, password],
    (error, results, fields) => dbCallback(error, results, fields, next, res, username, password)
  );
}

function dbProcess(error: Error, results: any, fields: any, next: NextFunction, response: Response, username: string, password: string) {
  if (error) throw error;

  const result = results[0].passwordCorrect;

  // if password correct set token cookie to jwt and set express local var to username
  if (result) {
    response.locals.username = username;
    response.cookie('token', createToken(username));
  }

  // either return a response model object or redirect to specified route if redirect property provided in request post body
  next();
}

function validateLoginRequest(req: Request, res: Response) {
  const err: Array<string> = [];
  // validate post body properties and http request method
  if (req.method != 'POST') {
    err.push('login requires a POST HTTP request but was ' + req.method + '.');
  }
  if (!req.body.username) {
    err.push('login requires a POST body "username" property.');
  }
  if (!req.body.password) {
    err.push('login requires a POST body "password" property.');
  }
  // console.log(err);
  // if (err.length != 0) {
  //   res.status(400).json(new LoginResponse(err));
  //   return false;
  // }
  return err;
}

// module.exports = login
// module.exports.validateLoginRequest = validateLoginRequest;
// module.exports.checkPassword = checkPassword;

export default login;
export { validateLoginRequest, checkPassword };