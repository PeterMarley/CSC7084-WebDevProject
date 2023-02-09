import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import controller from '../../controller/userController';

const userRouter = Router();

userRouter.use(authenticate);

// log out
userRouter.get('/logout', controller.logout);

// log in
userRouter.post('/login', controller.attemptLogin);
userRouter.get('/loginfailed', controller.loginFailed);

// register
userRouter.get('/register', controller.registerGet);
userRouter.post('/register', controller.registerPost, controller.attemptLogin);

// delete account
userRouter.delete('/deleteuser', controller.deleteUser);

// account
userRouter.get('/account', controller.initAccountDetailsLocals, controller.accountDetailsToLocals, controller.renderAccountPage);
userRouter.post('/account', controller.initAccountDetailsLocals, controller.accountDetailsToLocals, controller.postAccount, controller.renderAccountPage);
userRouter.post('/account/password', controller.initAccountDetailsLocals, controller.passwordChange);

export default userRouter;