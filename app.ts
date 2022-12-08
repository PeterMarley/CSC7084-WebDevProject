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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(function cookiePassthrough(req: Request, res: Response, next: NextFunction) {
// 	if (req.cookies && req.cookies.token) {
// 		console.log('setting cookie in cookiePassthrough()');
// 		res.cookie('token', req.cookies.token);
// 	}
// 	next();
// });
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
	const postBodyUrlForm = new URLSearchParams([['username', username], ['password', password], ['requestor', process.env.REQUESTOR!]]);
	const fetchResponse = await fetch(url, {
		method: 'POST',
		body: postBodyUrlForm,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});
	const body = await fetchResponse.text();
	console.log('body' + body);
	
	return JSON.parse(body);
}

app.get('/logout', (req: Request, res: Response) => {
	req.cookies.token = undefined;
	res.clearCookie('token');
	res.statusCode = 200;
	res.redirect('/');
});

app.get('/login', (req: Request, res: Response) => {
	// if (req.cookies && req.cookies.token) {
	// 	console.log('setting cookie in /login');
	// 	res.cookie('token', req.cookies.token);
	// }
	res.render('login');
});

app.post('/login' ,async (req: Request, res: Response, next: NextFunction) => {
	// const url = 'http://localhost:3000/auth/login';
	// post to /auth/login to get token
	// console.dir(req.body);
	debugger;
	if (!req.body || !req.body.username || !req.body.password) {
		res.statusCode = 401;
		res.send('invalid login post body');
		return;
	} else {
		res.statusCode = 200;
	}

	const { username, password } = req.body;
	const authResponse = await authenticatePost(username, password);

	// build response
	if (authResponse.success && authResponse.token) {
		res.cookie('token', authResponse.token);
	}
	//res.set('Content-Type', 'text/html');
	res.redirect(req.body.redirect ? req.body.redirect : '/login');
})

app.get('/', (req: Request, res: Response) => {
	res.render('welcome');
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
	res.send('that aint no valid route SONNY JIM MBOY: ' + req.originalUrl);
});

module.exports = app;