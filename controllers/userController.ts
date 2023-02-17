import { Request, Response, NextFunction } from "express";
import AccountDetailsGetResponse from '../api/models/responses/auth/AccountDetailsGetResponse';
import AccountDetailsUpdateResponse from '../api/models/responses/auth/AccountDetailsUpdateResponse';
import AccountPasswordUpdateResponse from '../api/models/responses/auth/AccountPasswordUpdateResponse';
import LoginResponse from '../api/models/responses/auth/LoginResponse';
import RegistrationResponse from '../api/models/responses/auth/RegistrationResponse';
import apiCall from "../utils/apiCall";

async function passwordChange(req: Request, res: Response) {

    const passwordNew = req.body['password-new'];
    const passwordNewConfirm = req.body['password-new-confirm'];
    const passwordOld = req.body['password-old'];

    // TODO check old password is correct first
    if (passwordNew !== passwordNewConfirm) {
        res.locals.messages = ['Password confirmation failed, be sure that your new password is exactly the same in both fields.'];
    } else {
        const { success }: AccountPasswordUpdateResponse =
            await apiCall("PATCH", 'api/auth/userdetails/' + res.locals.id + '/password', new URLSearchParams([['password', passwordNew]]));
        if (success) {
            res.locals.messages = ['Password updated!']
        } else {
            res.locals.messages = ['Password update failed! Try again later.']
        }
    }
    const { username, email }: AccountDetailsGetResponse = await apiCall("GET", 'api/auth/userdetails/' + res.locals.id);
    res.locals.username = username;
    res.locals.email = email;
    res.render('account');
}

async function accountDetailsToLocals(req: Request, res: Response, next: NextFunction) {

    const accountDetailsGetResponse = await UserRouterApiCalls.getAccountDetails(res.locals.id)

    res.locals.username = accountDetailsGetResponse.username;
    res.locals.email = accountDetailsGetResponse.email;

    next();
}

function renderAccountPage(req: Request, res: Response) {
    res.render('account');
}

async function postAccount(req: Request, res: Response, next: NextFunction) {

    const userId = res.locals.id;
    const { username: newUsername, email: newEmail }: AccountDetailsGetResponse = req.body;
    const { username: oldUsername, email: oldEmail } = res.locals;

    const messages: Array<string> = [];
    if (newUsername !== oldUsername || newEmail !== oldEmail) {

        const accountDetailsUpdateResponse = await UserRouterApiCalls.changeAccountDetails(userId, newUsername, newEmail);

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

    next();
}

function loginFailed(req: Request, res: Response) {
    res.render('test');
}

function registerGet(req: Request, res: Response) {
    res.render('register');
}

function logout(req: Request, res: Response) {
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

    const errors: String[] = UserRouterUtility.validateRegisterPostBody(req);

    if (errors.length > 0) {
        res.statusCode = 401;
        // TODO expand this       
        res.redirect('/register?vals=' + errors.join('-'));
        return;
    }
    const { username, email, password } = req.body;
    const registrationResponse = await UserRouterApiCalls.registerUser(username, email, password);

    if (registrationResponse.success) {
        next();
        return;
    } else {
        res.send(registrationResponse.error); //TODO return an actual page
        next('route');
    }
}

async function attemptLogin(req: Request, res: Response, next: NextFunction) {
    // validate request
    const errors = UserRouterUtility.validateLoginPostBody(req);

    if (errors.length > 0) {
        res.statusCode = 401;
        res.locals.validations = errors;
        // TODO expand this       
        res.render('loginfailed');
        return;
    }

    // cal auth api to check username/ password combination
    const { username, password } = req.body;
    const loginResponse = await UserRouterApiCalls.checkUsernamePassword(username, password);

    console.log(loginResponse);

    // build response & redirect as appropriate
    if (loginResponse.success && loginResponse.token) {
        res.locals.authed = true;
        res.locals.username = username;
        res.cookie('token', loginResponse.token);
        res.cookie('testcook', "a load of shite");
    } else if (!loginResponse.success) {
        //res.redirect('/login?vals=loginfail');
        res.locals.validations = ['login-unsuccessful'];
        res.render('loginfailed');
        return;
    } else {
        res.redirect('/500');
        return;
    }

    res.render('welcome');
}

function initAccountDetailsLocals(req: Request, res: Response, next: NextFunction) {
    res.locals.username = null;
    res.locals.email = null;
    res.locals.messages = null;
    next();
}

class UserRouterApiCalls {
    private static baseUrl: string = 'http://localhost:3000/api';

    static checkUsernamePassword = async function (username: string, password: string): Promise<LoginResponse> {
        const endpoint = 'api/auth/login';
        return await apiCall(
            'POST',
            endpoint,
            new URLSearchParams([['username', username], ['password', password]])
        );
    };

    static registerUser = async function (username: string, email: string, password: string): Promise<RegistrationResponse> {
        const endpoint = 'api/auth/register';
        return await apiCall(
            'POST',
            endpoint,
            new URLSearchParams([['username', username], ['email', email], ['password', password]])
        );
    }

    static getAccountDetails = async function (userId: number): Promise<AccountDetailsGetResponse> {
        const endpoint = '/auth/userdetails/' + userId;
        return await apiCall(
            "GET",
            endpoint
        );
    }

    static changeAccountDetails = async function (userId: number, newUsername: string, newEmail: string): Promise<AccountDetailsUpdateResponse> {
        const endpoint = 'api/auth/userdetails/' + userId;
        return await apiCall(
            'PUT',
            endpoint,
            new URLSearchParams([['username', newUsername], ['email', newEmail]])
        );
    }
}

class UserRouterUtility {
    static validateLoginPostBody = function (req: Request) {
        const errors: String[] = [];

        if (req.method.toUpperCase() != 'POST') errors.push('cannotget')
        if (!req.body) errors.push('nobody');
        if (!req.body.username) errors.push('nousername');
        if (!req.body.password) errors.push('nopassword');

        return errors;
    }

    static validateRegisterPostBody = function (req: Request) {
        const errors: String[] = [];

        if (req.method.toUpperCase() != 'POST') errors.push('cannotget')
        if (!req.body) errors.push('nobody');
        if (!req.body.username) errors.push('nousername');
        if (!req.body.email) errors.push('noemail');
        if (!req.body.password) errors.push('nopassword');

        return errors;
    }
}

const controller = {
    passwordChange,
    initAccountDetailsLocals,
    attemptLogin,
    registerPost,
    deleteUser,
    logout,
    registerGet,
    loginFailed,
    postAccount,
    renderAccountPage,
    accountDetailsToLocals
};

export default controller;