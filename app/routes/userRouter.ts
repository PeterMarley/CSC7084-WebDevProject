
import { Router } from 'express';
import { restrictedArea } from '../middleware/authenticate';
import controller from '../controllers/userController';
import methodOverride from 'method-override';

/*******************************************************
 * 
 * CONFIGURATION
 * 
 *******************************************************/

const userRouter = Router();

userRouter.use(methodOverride("_mo", { methods: ['POST'] }));

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
userRouter.post('/account', restrictedArea, controller.initAccountDetailsLocals, controller.accountDetailsToLocals, controller.postAccount, controller.renderAccountPage);
userRouter.post('/account/password', restrictedArea, controller.initAccountDetailsLocals, controller.passwordChange);

export default userRouter;