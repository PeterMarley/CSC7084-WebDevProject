/******************************
 * 
 * Express Config
 * 
 ******************************/

// const express = require('express');
import express, { Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';

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
import auth from './routes/api/auth/auth';
import { nextTick } from 'process';
import { NextFunction } from 'connect';

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(authenticate);

/******************************
 * 
 * Routers/ APIs
 * 
 ******************************/

// app.use('/auth', authRouter); // auth api
app.use('/auth', auth);

/******************************
 * 
 * Routes
 * 
 ******************************/

async function authenticatePost(username: string, password: string) {
  const url = 'http://localhost:3000/auth/login';
  const postBodyUrlForm = new URLSearchParams([['username', username], ['password', password]]);
  const fetchResponse = await fetch(url, {
    method: 'POST',
    body: postBodyUrlForm,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const body = await fetchResponse.text();
  return JSON.parse(body);
}

app.post('/logintest', async (req: Request, res: Response, next: NextFunction) => {
  // const url = 'http://localhost:3000/auth/login';
  // post to /auth/login to get token
  console.dir(req.body);
  if (!req.body || !req.body.username || !req.body.password) {
    res.statusCode = 401;
    res.send('invalid body');
    return;
  }
  const { username, password } = req.body;
  const authResponse = await authenticatePost(username, password);

  if (authResponse.success && authResponse.token) {
    res.cookie('token', authResponse.token);
  }

  // build express response
  res.set('Content-Type', 'application/json');
  
  res.send('bruh');
  // {
  //   method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //   mode: 'same-origin', // no-cors, *cors, same-origin
  //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  //   credentials: 'same-origin', // include, *same-origin, omit
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //     // 'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   // redirect: 'follow', // manual, *follow, error
  //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  //   body: JSON.stringify({
  //     username: 'username',
  //     password: 'password'
  //   }) // body data type must match "Content-Type" header
  // }
  ;
})

app.get('/', (req: Request, res: Response) => {
  res.render('welcome');
});

app.get('/login', (req: Request, res: Response) => {
  res.render('login');
});

app.get('/register', (req: Request, res: Response) => {
  res.render('register');
});

app.get('/test', (req: Request, res: Response) => {
  res.render('test');
});

// 404 NOT FOUND fallback route
app.get('*', (req: Request, res: Response) => {
  res.statusCode = 404;
  res.send('that aint no valid route SONNY JIM MBOY');
});

module.exports = app;