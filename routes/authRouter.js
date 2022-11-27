/******************************
 * 
 * Configure Auth Router
 * 
 ******************************/

const express = require('express');
const authRouter = express.Router();
const cookieParser = require('cookie-parser');

/******************************
 * 
 * Middleware
 * 
 ******************************/

const login = require('./middleware/login.js');
const { validateRegistrationForm, register } = require('./middleware/registration.js');
const authenticate = require('./middleware/authenticate.js');
const redirect = require('./middleware/redirect.js');
const logout = require('./middleware/logout.js');

authRouter.use(cookieParser());

/******************************
 * 
 * Routes
 * 
 ******************************/

authRouter.post('/login', express.urlencoded({ extended: false }), login, redirect);

// a testing only route for postman bants
authRouter.get('/authed', authenticate, function (req, res) {
  // console.log(res.locals.authed);
  res.send(res.locals.authed);
});

authRouter.get('/logout', logout, redirect);

authRouter.post('/register', express.urlencoded({ extended: false }), validateRegistrationForm, register, redirect);


module.exports = authRouter;