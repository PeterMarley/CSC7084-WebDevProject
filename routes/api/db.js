const express = require('express');
const session = require('express-session');
const CheckPasswordResponse = require('./authResponses');
const loginHandler = require('./lib/loginHandler.js');

const mysql = require('mysql');
const db = express.Router();

db.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: process.env.MOODR_SESSION_KEY,
  maxAge: 1000 * 60 * 60 * 24,
}));


db.post('/checkpassword', express.urlencoded({extended: false}), loginHandler);

module.exports = db;