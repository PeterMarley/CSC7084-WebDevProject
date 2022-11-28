/******************************
 * 
 * Express Config
 * 
 ******************************/

// const express = require('express');
import express, { Request, Response } from 'express';
import mysql from 'mysql';
//const mysql = require('mysql');
import path from 'path';
//const cookieParser = require('cookie-parser');
import cookieParser from 'cookie-parser';
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/******************************
 * 
 * Middlewear
 * 
 ******************************/

import authRouter from './routes/authRouter';
import authenticate from './routes/middleware/authenticate';

app.use(express.static('public'));
app.use(cookieParser());
app.use(authenticate);

// app.use(function debugPrint(req, res, next) {
//   console.log('-------------START--------------');
//   console.log('LOCALS:');
//   console.dir(res.locals ? res.locals : 'no locals');
//   console.log('--------------END---------------');

//   console.log('-------------START--------------');
//   console.log('COOKIES:');
//   console.dir(req.cookies ? req.cookies : 'no cookies');
//   console.log('--------------END---------------');

//   next();
// });

/******************************
 * 
 * Routers/ APIs
 * 
 ******************************/

app.use('/auth', authRouter); // auth api

/******************************
 * 
 * Routes
 * 
 ******************************/

app.get('/', (req: Request, res: Response) => {
  res.render('welcome');
});

app.get('/login', (req: Request, res: Response) => {
  res.render('login');
});

app.get('/register', (req: Request, res: Response) => {
  res.render('register');
});

// 404 NOT FOUND fallback route
app.get('*', (req: Request, res: Response) => {
  res.statusCode = 404;
  res.send('that aint no valid route SONNY JIM MBOY');
});

module.exports = app;