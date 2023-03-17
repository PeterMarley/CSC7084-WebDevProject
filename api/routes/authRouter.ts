/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express from 'express';
import controller from '../controllers/authController';
import authenticateRequestSource from '../middleware/authenticateRequestSource';

const authRouter = express.Router();

/*******************************************************
 * 
 * MIDDLEWARE
 * 
 *******************************************************/

authRouter.use(authenticateRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

authRouter.post('/login', controller.login);
authRouter.post('/register', controller.register);

authRouter.delete('/deleteuser/:userId', controller.deleteUserAccount);

authRouter.get('/userdetails/:userId', controller.getAccountDetails);
authRouter.patch('/userdetails/:userId', controller.updateAccountDetails);
authRouter.patch('/userdetails/:userId/password', controller.accountPasswordPatch);

export default authRouter;