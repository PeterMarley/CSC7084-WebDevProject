/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

import express from 'express';
import controller from '../controllers/userController';
import authorizeRequestSource from '../middleware/authorizeRequestSource';

const userRouter = express.Router();

/*******************************************************
 * 
 * MIDDLEWARE
 * 
 *******************************************************/

userRouter.use(authorizeRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

userRouter.post('/login', controller.login);
userRouter.post('/register', controller.register);

userRouter.delete('/:userId', controller.deleteUserAccount);

userRouter.get('/:userId', controller.getAccountDetails);
userRouter.patch('/:userId', controller.updateAccountDetails);
userRouter.patch('/:userId/password', controller.accountPasswordPatch);

export default userRouter;