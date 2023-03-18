
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


userRouter
    // log out
    .get('/logout', controller.logout)

    // log in
    .post('/login', controller.attemptLogin)
    .get('/loginfailed', controller.loginFailed)

    // register
    .get('/register', controller.registerGet)
    .post('/register', controller.registerPost, controller.attemptLogin)

    // delete account
    .delete('/deleteuser', restrictedArea, controller.deleteUser)

    // edit account
    .get('/account', restrictedArea, controller.initAccountDetailsLocals, controller.accountDetailsToLocals, controller.renderAccountPage)
    .patch('/account', restrictedArea, controller.initAccountDetailsLocals, controller.accountDetailsToLocals, controller.patchAccount, controller.renderAccountPage)
    .patch('/account/password', restrictedArea, controller.initAccountDetailsLocals, controller.passwordChange);

export default userRouter;