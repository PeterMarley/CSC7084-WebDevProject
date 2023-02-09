// express imports
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';

// app imports
import authenticate from './routes/middleware/authenticate';
import dotenv from 'dotenv';

// Router imports
import api from './routes/api/api';							// auth API
import mainRouter from './routes/routers/mainRouter';							// normal routing
import userRouter from './routes/routers/userRouter';
import entryRouter from './routes/routers/entryRouter';
import fallbackRouter from './routes/routers/fallbackRouter';

/******************************
 * 
 * Express Config
 * 
 ******************************/

const port  = 3000;
const app = express();

dotenv.config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authenticate);

/******************************
 * 
 * Database API Router
 * 
 * Normally this would be part of a seperate application, but for the purposes of this
 * project it is mounted in this express app
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
app.use('/', fallbackRouter);

app.listen(port, () => console.log('Moodr listening on port ' + port));

export default app;