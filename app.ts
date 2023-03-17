// express imports
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import https from 'https';
import fs from 'fs';
import config from './config/Config';
import methodOverride from 'method-override';

// app imports
import dotenv from 'dotenv';
import { authorize } from './app/middleware/authorize';

// Router imports
import api from './api/api';							// auth API
import mainRouter from './app/routes/mainRouter';							// normal routing
import userRouter from './app/routes/userRouter';
import moodRouter from './app/routes/moodRouter';
import injectConfig from './app/middleware/injectConfig';
import internalServerErrorHandler from './app/middleware/internalServerErrorHandler';

/******************************
 * 
 * Express Config
 * 
 ******************************/
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const httpsOpts = {
    key: fs.readFileSync('./ssl/private.key'),
    cert: fs.readFileSync('./ssl/certificate.crt'),
    rejectUnauthorized: false
};


const port = config.connection.port;
const app = express();

dotenv.config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

app.use(express.static('app/public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(injectConfig);
app.use(authorize);
app.use(methodOverride("_mo", { methods: ['GET', 'POST'] }));

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

app.use('/user', userRouter);
app.use('/mood', moodRouter);
app.use('/', mainRouter);

/******************************
 * 
 * Error Handlers
 * 
 ******************************/

app.use(internalServerErrorHandler);

/******************************
 * 
 * Server
 * 
 ******************************/

https
    .createServer(httpsOpts, app)
    .listen(port, () => console.log('Moodr listening on port ' + port));

export default app;