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
 * ROUTES
 * 
 *******************************************************/

authRouter.use(authenticateRequestSource);

authRouter.post('/login', controller.login);
authRouter.post('/register', controller.register);

authRouter.delete('/deleteuser', controller.deleteUserAccount);

authRouter.get('/userdetails/:userId', controller.getAccountDetails);
authRouter.put('/userdetails/:userId', controller.updateAccountDetails);
authRouter.patch('/userdetails/:userId/password', controller.accountPasswordPatch);

export default authRouter;