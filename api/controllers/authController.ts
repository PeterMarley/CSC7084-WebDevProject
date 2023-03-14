import { Request, Response, NextFunction } from "express";
import { ResultSetHeader, format, RowDataPacket } from "mysql2";
import AccountDetailsUpdateResponse from '../models/responses/auth/AccountDetailsUpdateResponse';
import AccountDetailsGetResponse from '../models/responses/auth/AccountDetailsGetResponse';
import AccountPasswordUpdateResponse from '../models/responses/auth/AccountPasswordUpdateResponse';
import DeleteAccountResponse from '../models/responses/auth/DeleteAccountResponse';
import RegistrationResponse from '../models/responses/auth/RegistrationResponse';
import LoginResponse from '../models/responses/auth/LoginResponse';
import config from "../../config/Config";
import dao from "../models/daos/auth-dao";



const SQL = {
    register: {
        insertUser: 'INSERT INTO tbl_user (username, password, email, user_icon_id) VALUES (?,?,?,1)',
        // insertMoods:
        //     `INSERT INTO tbl_mood
        //     (
        //         tbl_mood.name, 
        //         tbl_mood.order, 
        //         tbl_mood.icon_image_id, 
        //         tbl_mood.user_id
        //     )
        //     VALUES 
        //     ('Awful', 1, 1, ?),
        //     ('Bad', 2, 2, ?),
        //     ('Ok', 3, 3, ?),
        //     ('Good', 4, 4, ?),
        //     ('Great', 5, 5, ?)`,
        insertActivityGroups:
            `INSERT INTO tbl_activity_group
            (
                tbl_activity_group.name,
                tbl_activity_group.icon_image_id,
                tbl_activity_group.user_id
            )
            VALUES
            ('Default', 1, ?)`,
        insertDefaultActivities:
            `INSERT INTO tbl_activity
            (
                tbl_activity.name,
                tbl_activity.icon_image_id,
                tbl_activity.activity_group_id,
                tbl_activity.user_id
            )
            VALUES
            ('Work',1,?,?),
            ('Exersize',2,?,?)`
    }
}

const regex = {
    username: new RegExp(config.userDetailsValidation.username.regex),
    password: new RegExp(config.userDetailsValidation.password.regex),
    email: new RegExp(config.userDetailsValidation.email.regex),
};

async function accountPasswordPatch(req: Request, res: Response, next: NextFunction) {
    const userId = Number(req.params.userId);
    const { password } = req.body;
    let success = await dao.changePassword(password, userId);
    res.json(new AccountPasswordUpdateResponse(success));
}

async function updateAccountDetails(req: Request, res: Response, next: NextFunction) {
    // const sql = "SELECT username, email FROM tbl_user WHERE user_id=?";
    const userId = Number(req.params.userId);
    const { username, email } = req.body;

    let success = await dao.updateAccountDetails(userId, username, email);

    res.json(new AccountDetailsUpdateResponse(success, userId, username, email));
}

async function getAccountDetails(req: Request, res: Response, next: NextFunction) {

    const userId = Number(req.params.userId);
    const response = await dao.getAccountDetails(userId);
    res.json(response);
}

async function deleteUserAccount(req: Request, res: Response, next: NextFunction) {

    const { userId } = req.params;
    const response = await dao.deleteUserAccount(Number(userId));
    res.send(response);
}


async function register(req: Request, res: Response, next: NextFunction) {
    // validate post body properties exist


    // destructure registration information
    const { username, email, password } = req.body;

    const bodyValidationErr: Array<string> = [];
    // validate post body
    if (!username) bodyValidationErr.push('nousername');
    if (!email) bodyValidationErr.push('noemail');
    if (!password) bodyValidationErr.push('nopassword');
    
    console.log(regex);
    

    // validate user account details
    if (!regex.username.test(username)) bodyValidationErr.push('badusername');
    if (!regex.email.test(email)) bodyValidationErr.push('bademail');
    if (!regex.password.test(password)) bodyValidationErr.push('badpassword');

    if (bodyValidationErr.length !== 0) {
        // form BadRequest
        res.status(400).send(new RegistrationResponse(false, bodyValidationErr));
        return;
    }

    // Database
    const [statusCode, registrationResponse] = await dao.register(username, email, password);

    // Response
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

    if (!username) error.push('no username provided');
    if (!password) error.push('no password provided');

    if (error.length !== 0) {
        res.status(401).json(new LoginResponse(false, undefined, error));
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