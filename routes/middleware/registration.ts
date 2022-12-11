const { restart } = require('nodemon');
import getConnection from '../../lib/dbConnection';
import { RegistrationResponse } from '../../models/authResponses';
import { Request, Response, NextFunction } from 'express';

/**
 * Express middlewear that received a registration forms data, and validates it via SQL queries to the database, then calls next()
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export async function validateRegistrationForm(req: Request, res: Response, next: NextFunction) {

  // validate post body properties exist
  if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
    res.status(400).send(new RegistrationResponse(false, 'post body missing required fields'));
    return;
  }

  // get vars from post body & validate values
  const { username, email, password } = req.body;

  // validation here

  const errMsg = {
    username: '',
    email: ''
  };

  // query database to ensure username and email
  const con = await getConnection();
  const usernameResponse = await con.execute('SELECT COUNT(username) AS usernameCount FROM tbl_user WHERE username=?', [username]) as any;
  const emailResponse = await con.execute('SELECT COUNT(email) AS emailCount FROM tbl_user WHERE email=?', [email]) as any;

  console.dir(usernameResponse);
  console.dir(emailResponse);
  


  // function (error, results, fields) {
  //   if (error) throw error;

  //   const usernameCount = results[0][0].usernameCount;
  //   const emailCount = results[1][0].emailCount;

  //   // check if username and email are unique
  //   if (usernameCount != 0) {
  //     errMsg.username = 'this username is already taken';
  //   }
  //   if (emailCount != 0) {
  //     errMsg.email = 'this email is already taken';
  //   }

  //   if (!errMsg.username && !errMsg.email) {
  //     res.locals.registration = {
  //       success: true,
  //       user: { username, email, password },
  //     };
  //   } else {
  //     res.locals.registration = {
  //       success: false,
  //       errors: errMsg,
  //     };
  //   }

  //   next();
  // }

  con.end(); // close connection
}

/**
 * Express middle wear that will register a user in the database then call next(). Dumb method, will not attempt to validate the users details
 */
// export function register(req: Request, res: Response, next: NextFunction, getConnectionFunc = getConnection) {
//   if (res.locals.registration && res.locals.registration.success) {
//     const { username, password, email } = res.locals.registration.user;
//     const con = getConnectionFunc();
//     con.query('INSERT INTO tbl_user (username, password, email) VALUES (?,fn_1WayEncrypt(?,NULL),?)', [username, password, email], function (error, results, fields) {
//       if (error) throw error;
//     });
//   }
//   next();
// }