// express imports
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';

// app imports
import dotenv from 'dotenv';
import { authenticate } from './app/middleware/authenticate';

// Router imports
import api from './api/api';							// auth API
import mainRouter from './app/routes/mainRouter';							// normal routing
import userRouter from './app/routes/userRouter';
import entryRouter from './app/routes/entryRouter';
import fallbackRouter from './app/routes/fallbackRouter';

/******************************
 * 
 * Express Config
 * 
 ******************************/

const port  = 3000;
const app = express();

dotenv.config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

app.use(express.static('app/public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authenticate);

/******************************
 * 
 * Database API Router
 * 
 * Normally this would be part of a seperate application, but for the purposes of this
 * project it is mounted in this express app as an ExpressJS Router
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