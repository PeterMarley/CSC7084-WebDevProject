import { Request, Response, NextFunction } from "express";
import AccountDetailsUpdateResponse from '../../common/response/AccountDetailsUpdateResponse';
import RegistrationResponse from '../../common/response/RegistrationResponse';
import LoginResponse from '../../common/response/LoginResponse';
import config from "../../common/config/Config";
import dao from "../database/auth-dao";
import SuccessResponse from "../../common/response/SuccessResponse";

const regex = {
    username: new RegExp(config.userDetailsValidation.username.regex),
    password: new RegExp(config.userDetailsValidation.password.regex),
    email: new RegExp(config.userDetailsValidation.email.regex),
};

async function accountPasswordPatch(req: Request, res: Response, next: NextFunction) {
    const userId = Number(req.params.userId);
    const { password } = req.body;
    let success = await dao.changePassword(password, userId);
    res.json(new SuccessResponse(success));
}

async function updateAccountDetails(req: Request, res: Response, next: NextFunction) {
    // const sql = "SELECT username, email FROM tbl_user WHERE user_id=?";
    const userId = Number(req.params.userId);
    let username = decodeURIComponent(req.body.username);
    let email = decodeURIComponent(req.body.email);

    const errors: string[] = [];
    if (!userId) errors.push('userID must be a numeric value');
    if (!username || !regex.username.test(username)) errors.push('username is invalid.');
    if (!email || !regex.email.test(email)) errors.push('email is invalid.');

    if (errors.length > 0) {
        res.status(400).json(new SuccessResponse(false, errors));
        return;
    }

    username = decodeURIComponent(req.body.username);
    email = decodeURIComponent(req.body.email);

    let success = await dao.updateAccountDetails(userId, username, email);

    res.status(success ? 200 : 404).json(new AccountDetailsUpdateResponse(success, userId, username, email));
}

async function getAccountDetails(req: Request, res: Response, next: NextFunction) {

    const userId = Number(req.params.userId);
    if (userId) {
        const response = await dao.getAccountDetails(userId);
        res.status(response ? 200 : 404).json(response);
    } else {
        res.status(400).json(new SuccessResponse(false, ['UserID was a non numeric value']));
    }
}

async function deleteUserAccount(req: Request, res: Response, next: NextFunction) {

    const userId = Number(req.params.userId);
    if (!userId) {
        res.status(400).json(new SuccessResponse(false, ['UserID was not a numeric value']));
        return;
    }
    const [statusCode, response] = await dao.deleteUserAccount(Number(userId));
    res.status(statusCode).send(response);
}

async function register(req: Request, res: Response, next: NextFunction) {
    // destructure registration information
    let { username, email, password } = req.body;

    const bodyValidationErr: Array<string> = [];
    // validate post body
    if (!username) bodyValidationErr.push('No username provided.');
    if (!email) bodyValidationErr.push('No email provided');
    if (!password) bodyValidationErr.push('No password provided');

    username = decodeURIComponent(username);
    email = decodeURIComponent(email);
    password = decodeURIComponent(password);

    // validate user account details
    if (username && !regex.username.test(username)) bodyValidationErr.push(config.userDetailsValidation.username.description);
    if (email && !regex.email.test(email)) bodyValidationErr.push(config.userDetailsValidation.email.description);
    if (password && !regex.password.test(password)) bodyValidationErr.push(config.userDetailsValidation.password.description);

    if (bodyValidationErr.length !== 0) {
        // 400 BadRequest
        res.status(400).send(new RegistrationResponse(false, bodyValidationErr));
        return;
    }

    // Database
    const [statusCode, registrationResponse] = await dao.register(username, email, password);

    // Response 201, 409 or 500
    res.status(statusCode).json(registrationResponse);
}

/**
 * Express Middleware: Checks a username and password provided in post body against DB and if correct, sets a JWT token into a cookie on users
 * browser.
 * @param req 
 * @param res 
 * @param next 
 */
async function login(req: Request, res: Response, next: NextFunction) {

    const error: Array<string> = [];
    const { username, password } = req.body;

    if (!username) error.push('No Username provided.');
    if (!password) error.push('No Password provided.');
    if (username && !regex.username.test(username)) {
        error.push(config.userDetailsValidation.username.description);
    }
    if (password && !regex.password.test(password)) {
        error.push(config.userDetailsValidation.password.description);
    }

    if (error.length !== 0) {
        res.status(400).json(new LoginResponse(false, undefined, error));
        return;
    }

    const [statusCode, loginResponse] = await dao.login(username, password);

    // prepare and send json response
    res.status(statusCode).json(loginResponse);
}

const controller = {
    login,
    register,
    deleteUserAccount,
    getAccountDetails,
    updateAccountDetails,
    accountPasswordPatch
};

export default controller;