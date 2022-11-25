/******************************
 * 
 * Configure Auth Router
 * 
 ******************************/

const express = require('express');
const authRouter = express.Router();
const session = require('express-session');
const loginHandler = require('./middleware/loginHandler.js');
const authHandler = require('./middleware/authHandler.js');
const cookieParser = require('cookie-parser');

/******************************
 * 
 * Middleware
 * 
 ******************************/

authRouter.use(cookieParser());

authRouter.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: process.env.MOODR_SESSION_KEY,
  maxAge: 1000 * 60 * 60 * 24,
}));

/******************************
 * 
 * Routes
 * 
 ******************************/

authRouter.post('/login', express.urlencoded({ extended: false }), loginHandler);

authRouter.get('/auth', authHandler);

authRouter.post('/logout', express.urlencoded({ extended: false }), (req, res) => {
  res.send(req.body.username);
});

module.exports = authRouter;