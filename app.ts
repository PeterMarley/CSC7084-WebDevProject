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
import authAPI from './routes/api/auth/authAPI';							// auth API
import mainRouter from './routes/routers/mainRouter';							// normal routing
import userRouter from './routes/routers/userRouter';
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
 * APIs
 * 
 ******************************/

app.use('/auth', authAPI);

/******************************
 * 
 * Routes / Routers
 * 
 ******************************/

app.use('/', mainRouter);
app.use('/', userRouter);

// 404 NOT FOUND fallback route
app.get('*', (req: Request, res: Response) => {
	res.statusCode = 404;
	res.send('that aint no valid route SONNY JIM MBOY: ' + req.originalUrl);
});

export default app;