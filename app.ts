/******************************
 * 
 * Express Config
 * 
 ******************************/

// express imports
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';

// app imports
import authenticate from './routes/middleware/authenticate';
import auth from './routes/api/auth/auth';							// auth API
import main from './routes/routers/main';							// normal routing

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
 * APIs
 * 
 ******************************/

app.use('/auth', auth);

/******************************
 * 
 * Routes / Routers
 * 
 ******************************/

app.use('/', main);

// 404 NOT FOUND fallback route
app.get('*', (req: Request, res: Response) => {
	res.statusCode = 404;
	res.send('that aint no valid route SONNY JIM MBOY: ' + req.originalUrl);
});

export default app;