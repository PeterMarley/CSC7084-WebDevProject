import { Request, Response, NextFunction } from "express";
import AccountDetailsGetResponse from '../../api/models/responses/auth/AccountDetailsGetResponse';
import AccountDetailsUpdateResponse from '../../api/models/responses/auth/AccountDetailsUpdateResponse';
import AccountPasswordUpdateResponse from '../../api/models/responses/auth/AccountPasswordUpdateResponse';
import LoginResponse from '../../api/models/responses/auth/LoginResponse';
import RegistrationResponse from '../../api/models/responses/auth/RegistrationResponse';
import config from "../../config/Config";
import apiCall from "../utils/apiCall";
import { verifyToken } from "../utils/jwtHelpers";
import validator from "validator";

const regex = {
    username: new RegExp(config.userDetailsValidation.username.regex),
    password: new RegExp(config.userDetailsValidation.password.regex),
    email: new RegExp(config.userDetailsValidation.email.regex)
};


class UserController {
    async passwordChange(req: Request, res: Response) {

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
    async accountDetailsToLocals(req: Request, res: Response, next: NextFunction) {

        const accountDetailsGetResponse = await apiCall(
            "GET",
            'api/auth/userdetails/' + res.locals.id
        );
        res.locals.username = accountDetailsGetResponse.username;
        res.locals.email = accountDetailsGetResponse.email;

        next();
    }
    renderAccountPage(req: Request, res: Response) {
        res.render('account');
    }
    async postAccount(req: Request, res: Response, next: NextFunction) {

        const userId = res.locals.id;
        const { username: newUsername, email: newEmail }: AccountDetailsGetResponse = req.body;
        const { username: oldUsername, email: oldEmail } = res.locals;

        const messages: Array<string> = [];
        if (newUsername !== oldUsername || newEmail !== oldEmail) {

            const accountDetailsUpdateResponse = await apiCall(
                'PUT',
                'api/auth/userdetails/' + userId,
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

        next();
    }
    loginFailed(req: Request, res: Response) {
        res.render('test');
    }
    registerGet(req: Request, res: Response) {
        res.render('register');
    }
    logout(req: Request, res: Response) {
        req.cookies.token = undefined;
        res.clearCookie('token');
        res.statusCode = 200;
        res.redirect('/');
    }
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        // const confirmed = (req.body.confirmation ?? false) ? true : false;
        // if (confirmed) {
        await apiCall('DELETE', '/api/auth/deleteuser/' + res.locals.id);
        res.clearCookie('token');
        //res.redirect(302, '/');
        res.locals.authed = false;
        res.render('accountdeleted');
        // } else {
        // 	console.log('delete user body not complete')
        // 	res.redirect(500, '/500');
        // }
    }
    async registerPost(req: Request, res: Response, next: NextFunction) {

        const errors: String[] = [];
        if (!req.body.username) errors.push('No Username');
        if (!req.body.email) errors.push('No Email');
        if (!req.body.password) errors.push('No Password');

        const { username, email, password } = req.body;

        if (username && !regex.username.test(username)) errors.push(config.userDetailsValidation.username.description);
        if (password && !regex.password.test(password)) errors.push(config.userDetailsValidation.password.description);
        if (email && !regex.email.test(email)) errors.push(config.userDetailsValidation.email.description);


        if (errors.length > 0) {
            res.status(400).render('registerfailed', {
                attemptedUsername: username,
                attemptedEmail: email,
                validationErrors: errors
            });
            return;
        }


        const registrationResponse = await apiCall(
            'POST',
            'api/auth/register',
            new URLSearchParams([['username', username], ['email', email], ['password', password]])
        ) as RegistrationResponse;

        if (registrationResponse.success) {
            next();
            return;
        } else {
            res.render('registerfailed', {
                attemptedUsername: username,
                attemptedEmail: email,
                validationErrors: registrationResponse.error
            });
        }
    }
    async attemptLogin(req: Request, res: Response, next: NextFunction) {

        // validate request
        const errors: String[] = [];

        if (req.method.toUpperCase() != 'POST') errors.push('cannotget')
        if (!req.body) errors.push('nobody');
        if (!req.body.username) errors.push('nousername');
        if (!req.body.password) errors.push('nopassword');

        if (errors.length > 0) {
            res.statusCode = 400;
            res.locals.validations = errors;
            // TODO expand this       
            res.status(400).render('loginfailed');
            return;
        }

        // cal auth api to check username/ password combination
        const { username, password } = req.body;
        const loginResponse = await apiCall(
            'POST',
            'api/auth/login',
            new URLSearchParams([['username', username], ['password', password]])
        );
        console.log(loginResponse);

        // build response & send
        const COOKIE_NAME = "token";
        if (loginResponse.success && loginResponse.token) {
            const userId = verifyToken(loginResponse.token).id;
            res.status(200)
                .cookie(COOKIE_NAME, loginResponse.token)
                .render('welcome', {
                    authed: true,
                    username: username,
                    userId: userId,
                });
        } else if (!loginResponse.success) {
            //res.redirect('/login?vals=loginfail');
            res.locals.authed = false;
            // res.locals.validations = ['login-unsuccessful'];
            res.locals.errors = loginResponse.error;
            res.status(401)
                .clearCookie(COOKIE_NAME)
                .render('loginfailed');
            return;
        } else {
            res.locals.authed = false;
            res.status(500)
                .clearCookie(COOKIE_NAME)
                .redirect('/500');
            return;
        }
    }
    initAccountDetailsLocals(req: Request, res: Response, next: NextFunction) {
        res.locals.username = null;
        res.locals.email = null;
        res.locals.messages = null;
        next();
    }
}

export default new UserController();