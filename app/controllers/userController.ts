import { Request, Response, NextFunction } from "express";
import AccountDetailsGetResponse from '../../common/response/AccountDetailsGetResponse';
import AccountPasswordUpdateResponse from '../../common/response/AccountPasswordUpdateResponse';
import RegistrationResponse from '../../common/response/RegistrationResponse';
import config from "../../common/config/Config";
import apiCall from "../utils/apiCall";
import { verifyToken } from "../utils/jwtHelpers";

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
                await apiCall("PATCH", 'api/user/' + res.locals.id + '/password', new URLSearchParams([['password', passwordNew]]));
            if (success) {
                res.locals.messages = ['Password updated!']
            } else {
                res.locals.messages = ['Password update failed! Try again later.']
            }
        }
        const { username, email }: AccountDetailsGetResponse = await apiCall("GET", 'api/user/' + res.locals.id);
        res.locals.username = username;
        res.locals.email = email;
        res.render('account');
    }

    async accountDetailsToLocals(req: Request, res: Response, next: NextFunction) {

        const accountDetailsGetResponse = await apiCall(
            "GET",
            'api/user/' + res.locals.id
        );
        res.locals.username = accountDetailsGetResponse.username;
        res.locals.email = accountDetailsGetResponse.email;

        next();
    }

    renderAccountPage(req: Request, res: Response) {
        res.render('account');
    }

    async patchAccount(req: Request, res: Response, next: NextFunction) {

        const userId = res.locals.id;
        const { username: newUsername, email: newEmail }: AccountDetailsGetResponse = req.body;
        const { username: oldUsername, email: oldEmail } = res.locals;

        const messages: Array<string> = [];
        if (newUsername !== oldUsername || newEmail !== oldEmail) {

            const accountDetailsUpdateResponse = await apiCall(
                'PATCH',
                'api/user/' + userId,
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
        await apiCall('DELETE', '/api/user/' + res.locals.id);
        res.clearCookie('token');
        res.locals.authed = false;
        res.render('accountdeleted');
    }

    async registerPost(req: Request, res: Response, next: NextFunction) {

        // validate POST body

        const errors: String[] = [];
        if (!req.body.username) errors.push('No Username');
        if (!req.body.email) errors.push('No Email');
        if (!req.body.password) errors.push('No Password');
        if (!req.body['password-confirm']) errors.push('No Password Confirmation');

        const { username, email, password } = req.body;
        const passwordConfirm = req.body['password-confirm'];

        if (username && !regex.username.test(username)) errors.push(config.userDetailsValidation.username.description);
        if (password && !regex.password.test(password)) errors.push(config.userDetailsValidation.password.description);
        if (email && !regex.email.test(email)) errors.push(config.userDetailsValidation.email.description);
        if (passwordConfirm && password !== passwordConfirm) errors.push("Password and Confirm Password do not match");

        if (errors.length > 0) {
            res.status(400).render('registerfailed', {
                attemptedUsername: username,
                attemptedEmail: email,
                validationErrors: errors
            });
            return;
        }

        // call to API

        const registrationResponse = await apiCall(
            'POST',
            'api/user/register',
            new URLSearchParams([['username', username], ['email', email], ['password', password]])
        ) as RegistrationResponse;

        // process response

        if (registrationResponse.success) {
            next();
            return;
        } else {
            res.status(200).render('registerfailed', {
                attemptedUsername: username,
                attemptedEmail: email,
                validationErrors: registrationResponse.errors
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
            res.locals.validations = errors;
            res.status(400).render('loginfailed');
            return;
        }

        // cal auth api to check username/ password combination
        const { username, password } = req.body;
        const loginResponse = await apiCall(
            'POST',
            'api/user/login',
            new URLSearchParams([['username', username], ['password', password]])
        );

        // build response & send
        const COOKIE_NAME = "token";
        if (loginResponse.success && loginResponse.token) {
            const userId = verifyToken(loginResponse.token).id;
            res.locals.authed = true;
            res.locals.username = username;
            res.locals.userId - userId;

            res.status(200)
                .cookie(COOKIE_NAME, loginResponse.token)
                .render('welcome');
        } else if (!loginResponse.success) {
            res.locals.authed = false;
            res.locals.errors = loginResponse.error;

            res.status(401)
                .clearCookie(COOKIE_NAME)
                .render('loginfailed');
        } else {
            res.locals.authed = false;

            res.status(500)
                .clearCookie(COOKIE_NAME)
                .redirect('/error');
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