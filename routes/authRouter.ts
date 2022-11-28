/******************************
 * 
 * Configure Auth Router
 * 
 ******************************/

import express from 'express';
const authRouter = express.Router();
import cookieParser from 'cookie-parser';

/******************************
 * 
 * Middleware
 * 
 ******************************/

import login from './middleware/login';
import { validateRegistrationForm, register } from './middleware/registration';
import authenticate from './middleware/authenticate';
import redirect from './middleware/redirect';
import logout from './middleware/logout';

import {Request, Response} from 'express';

authRouter.use(cookieParser());

/******************************
 * 
 * Routes
 * 
 ******************************/

authRouter.post('/login', express.urlencoded({ extended: false }), login, redirect);

// a testing only route for postman bants
authRouter.get('/authed', authenticate, function (req: Request, res: Response) {
  // console.log(res.locals.authed);
  res.send(res.locals.authed);
});

authRouter.get('/logout', logout, redirect);

authRouter.post('/register', express.urlencoded({ extended: false }), validateRegistrationForm, register, redirect);


//module.exports = authRouter;
export default authRouter;