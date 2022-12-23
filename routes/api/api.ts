/******************************
 * 
 * Router Config
 * 
 ******************************/

// express imports
import express from 'express';

// app imports
import authAPI from './auth/authApi';
import moodAPI from './mood/moodApi';

// configure express
const api = express.Router();

/******************************
 * 
 * APIs
 * 
 ******************************/

api.use('/auth', authAPI);
api.use('/mood', moodAPI);

// 404 NOT FOUND fallback route
api.all('*', (req: express.Request, res: express.Response) => {
	res.statusCode = 404;
	res.send('that aint no valid API JIMBOB ME SON: ' + req.originalUrl);
});

export default api;