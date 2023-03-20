
import { Router } from 'express';
import restrictedArea from '../middleware/restrictedArea';
import controller from '../controllers/userController';

/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

const userRouter = Router();

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

// log out
userRouter.get('/logout', controller.logout);

// log in
userRouter.post('/login', controller.attemptLogin);
userRouter.get('/loginfailed', controller.loginFailed);

// register
userRouter.get('/register', controller.registerGet);
userRouter.post('/register', controller.registerPost, controller.attemptLogin);

// delete account
userRouter.delete('/deleteuser', restrictedArea, controller.deleteUser);

// edit account
userRouter.get('/account', restrictedArea, controller.initAccountDetailsLocals, controller.accountDetailsToLocals, controller.renderAccountPage);
userRouter.patch('/account', restrictedArea, controller.initAccountDetailsLocals, controller.accountDetailsToLocals, controller.patchAccount, controller.renderAccountPage);
userRouter.patch('/account/password', restrictedArea, controller.initAccountDetailsLocals, controller.passwordChange);

export default userRouter;