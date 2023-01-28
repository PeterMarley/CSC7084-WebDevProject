/******************************
 * 
 * Express Config
 * 
 ******************************/

// express imports
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';

// app imports
import api from './routes/api/api';							// auth API
import mainRouter from './routes/routers/mainRouter';							// normal routing
import userRouter from './routes/routers/userRouter';
import entryRouter from './routes/routers/entryRouter';

import authenticate from './routes/middleware/authenticate';


// configure express
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// configure middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authenticate);

/******************************
 * 
 * Database API
 * 
 ******************************/

app.use('/api', api);

/******************************
 * 
 * Routes / Routers
 * 
 ******************************/

app.use('/', mainRouter);
app.use('/', userRouter);
app.use('/entry', entryRouter);

app.all('/weathertest', async (req: Request, res: Response) => {
	
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': '535c982d9cmshda84425959986f5p1d34c5jsnbe2f7c33ef4b',
			'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
		}
	};
	// TODO add selection for location during registration then use it for visualisation
	const result = await fetch('https://weatherapi-com.p.rapidapi.com/search.json?q=Belfast', options);
	const json = await result.json();
	// .then(response => response.json())
	// .then(response => console.log(response))
	// .catch(err => console.error(err));

	res.json(json);
});

app.all('/bulmatest', (req: Request, res: Response) => {
	res.render('bulmatest');
});

// 500 ISE
app.all('/500', (req: Request, res: Response) => {
	res.statusCode = 500;
	res.send('big fat 500: ' + req.originalUrl);
})
// 404 NOT FOUND fallback route
app.all('*', (req: Request, res: Response) => {
	res.statusCode = 404;
	res.send('that aint no valid route SONNY JIM MBOY: ' + req.originalUrl);
});

export default app;