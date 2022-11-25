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

const loginHandler = require('./middleware/loginHandler.js');
const authHandler = require('./middleware/authHandler.js');
const { raw } = require('mysql');

authRouter.use(cookieParser());

// authRouter.use(session({
//   resave: false, // don't save session if unmodified
//   saveUninitialized: false, // don't create session until something stored
//   secret: process.env.MOODR_SESSION_KEY,
//   maxAge: 1000 * 60 * 60 * 24,
// }));

/******************************
 * 
 * Routes
 * 
 ******************************/

authRouter.post('/login', express.urlencoded({ extended: false }), loginHandler);

authRouter.get('/auth', authHandler, function (req, res) {
  console.log(res.locals.authed);
  res.send(res.locals.authed);
});

authRouter.post('/logout', express.urlencoded({ extended: false }), (req, res) => {
  res.clearCookie('token');
  if (req.body.redirect) {
    res.redirect(req.body.redirect);
  } else {
    res.send(200);
  }
});

module.exports = authRouter;