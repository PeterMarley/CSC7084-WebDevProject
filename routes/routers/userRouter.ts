import express, { Request, Response, NextFunction } from 'express';
import RegistrationResponse from '../../models/RegistrationResponse';
import apiCall from '../../lib/apiCall';
import authenticate from '../middleware/authenticate';
import { AccountDetailsGetResponse, AccountDetailsUpdateResponse } from '../api/auth/authApiModel';
const userRouter = express.Router();

userRouter.use(authenticate);

// log out
userRouter.get('/logout', logoutGet);

// log in
userRouter.get('/login', loginGet);
userRouter.post('/login', loginPost);
userRouter.get('/loginfailed', loginFailed);

// register
userRouter.get('/register', registerGet);
userRouter.post('/register', registerPost, loginPost);

// delete account
userRouter.delete('/deleteuser', deleteUser);

// account
userRouter.get('/account', initAccountDetailsLocals, getAccount);
userRouter.post('/account', initAccountDetailsLocals, postAccount);
//userRouter.post('/account/password', initAccountDetailsLocals, passwordChange);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

async function passwordChange() {
    //TODO
}

function initAccountDetailsLocals(req: Request, res: Response, next: NextFunction) {
    res.locals.username = null;
    res.locals.email = null;
    res.locals.messages = null;
    next();
}

async function getAccount(req: Request, res: Response) {
    const { username, email }: { username: string, email: string } =
        await apiCall(
            "GET",
            'http://localhost:3000/api/auth/userdetails/' + res.locals.id
        );
    res.locals.username = username;
    res.locals.email = email;
    console.log(res.locals);

    res.render('account');
}

async function postAccount(req: Request, res: Response) {

    const { username: newUsername, email: newEmail }: AccountDetailsGetResponse = req.body;
    const { username: oldUsername, email: oldEmail }: AccountDetailsGetResponse = await apiCall(
        "GET",
        'http://localhost:3000/api/auth/userdetails/' + res.locals.id
    );

    const messages: Array<string> = [];
    if (newUsername !== oldUsername || newEmail !== oldEmail) {
        const accountDetailsUpdateResponse: AccountDetailsUpdateResponse = await apiCall(
            'PUT',
            'http://localhost:3000/api/auth/userdetails/' + res.locals.id,
            new URLSearchParams([['username', newUsername], ['email', newEmail]])
        );

        const { success } = accountDetailsUpdateResponse;
        if (success && newUsername !== oldUsername) {
            messages.push('Username was updated.');
        }
        if (success && newEmail !== oldEmail) {
            messages.push('Email was updated.');
        }
        if (!success) {
            messages.push('I\'m sorry, but your account details change was unsuccessful. Try again later.');
        }
    } else {
        messages.push('Your details remained unchanged as provided values were the same as current values.');
    }



    res.locals.username = newUsername;
    res.locals.email = newEmail;
    res.locals.messages = messages;

    console.log(res.locals.messages);

    res.render('account');
}

function loginFailed(req: Request, res: Response) {
    res.render('test');
}

function registerGet(req: Request, res: Response) {
    res.render('register');
}

function loginGet(req: Request, res: Response) {
    res.render('login');
}

function logoutGet(req: Request, res: Response) {
    req.cookies.token = undefined;
    res.clearCookie('token');
    res.statusCode = 200;
    res.redirect('/');
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
    if (req.body.confirmation) {
        await apiCall(
            'DELETE',
            'http://localhost:3000/api/auth/deleteuser',
            new URLSearchParams([['confirmation', req.body.confirmation ? 'true' : 'false']]),
            req.cookies.token
        );
        res.clearCookie('token');
        res.redirect(302, '/');
    }
}

async function registerPost(req: Request, res: Response, next: NextFunction) {

    const errors: String[] = [];

    if (req.method.toUpperCase() != 'POST') errors.push('cannotget')
    if (!req.body) errors.push('nobody');
    if (!req.body.username) errors.push('nousername');
    if (!req.body.email) errors.push('noemail');
    if (!req.body.password) errors.push('nopassword');

    if (errors.length > 0) {
        res.statusCode = 401;
        // TODO expand this       
        res.redirect('/register?vals=' + errors.join('-'));
        return;
    }

    const registrationResponse: RegistrationResponse = await apiCall(
        'POST',
        'http://localhost:3000/api/auth/register',
        new URLSearchParams([['username', req.body.username], ['email', req.body.email], ['password', req.body.password]])
    );
    if (registrationResponse.success) {
        next();
    } else {
        res.send(registrationResponse.error); //TODO return an actual page
        next('route');
    }
}

async function loginPost(req: Request, res: Response, next: NextFunction) {
    // validate request
    const errors: String[] = [];

    if (req.method.toUpperCase() != 'POST') errors.push('cannotget')
    if (!req.body) errors.push('nobody');
    if (!req.body.username) errors.push('nousername');
    if (!req.body.password) errors.push('nopassword');

    if (errors.length > 0) {
        res.statusCode = 401;
        res.locals.validations = errors;
        // TODO expand this       
        res.render('loginfailed');//?vals=' + errors.join('-')
        return;
    }

    // cal auth api to check username/ password combination
    const { username, password } = req.body;
    const authResponse = await apiCall(
        'POST',
        'http://localhost:3000/api/auth/login',
        new URLSearchParams([['username', username], ['password', password]])
    );

    // build response & redirect as appropriate
    if (authResponse.success && authResponse.token) {
        res.cookie('token', authResponse.token);
    } else if (!authResponse.success) {
        //res.redirect('/login?vals=loginfail');
        res.locals.validations = ['login-unsuccessful'];
        res.render('loginfailed');
        return;
    } else {
        res.redirect('/500');
        return;
    }
    res.redirect(req.body.redirect ? req.body.redirect : '/');
}

export default userRouter;