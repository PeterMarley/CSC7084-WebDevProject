import express, { Request, Response, NextFunction } from 'express';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
import checkPasswordCorrect from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
import RegistrationResponse from '../../../models/RegistrationResponse';
import getConnection from '../../../lib/dbConnection';
import PasswordQueryResponse from '../../../models/PasswordQueryResponse';
import { encrypt } from '../../../lib/crypt';
import { JwtPayload } from 'jsonwebtoken';
const auth = express.Router();

/*
API DESCRIPTION

- post username and password to api, get token back?
- require a website token perhaps to limit outside access?
        - this token can live in .env file/ environment variables
*/
auth.use(express.urlencoded({ extended: false }));
auth.use(authenticateRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

auth.post('/login', login);
auth.post('/register', register);
auth.delete('/deleteuser', deleteuser);

/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

async function deleteuser(req: Request, res: Response, next: NextFunction) {
    let success = false;
    let error: string | undefined;
    if (req.body && req.body.confirmation) {
        try {
            const token: JwtPayload = verifyToken(req.cookies.token)
            console.log(token);
            console.log(Object.keys(token));
            console.log(token.username);

            const con = await getConnection();
            con.execute('DELETE FROM tbl_user WHERE username=? AND user_id=?', [token.username, token.id])
            con.end();
            success = true;
        } catch (err: any) {
            error = err.message as string;
        }
    }

    res.send(new DeleteAccountResponse(success, error));
    //con.execute('DELETE FROM tbl_user WHERE username=?', [token.username]);
}

class DeleteAccountResponse {
    success: boolean;
    error: string | undefined;
    constructor(success: boolean, error: string | undefined = undefined) {
        this.success = success;
        if (error) this.error = error;
    }
}

async function register(req: Request, res: Response, next: NextFunction) {
    // check request authorization
    if (req.get('Authorization') !== 'Bearer ' + process.env.REQUESTOR) {
        res.status(401).send(new RegistrationResponse(false, ['Not Authorized']));
    }

    // validate post body properties exist
    const bodyValidationErr: Array<string> = [];
    if (!req.body) bodyValidationErr.push('post body empty');
    if (!req.body.username) bodyValidationErr.push('post body missing username');
    if (!req.body.email) bodyValidationErr.push('post body missing email');
    if (!req.body.password) bodyValidationErr.push('post body missing password');

    if (bodyValidationErr.length !== 0) {
        res.status(401).send(new RegistrationResponse(false, bodyValidationErr));
        return;
    }

    // destructure registration information
    const { username, email, password } = req.body;

    // validate registration info by database query to ensure username and email unique
    let con = await getConnection();
    const usernameResponse = await con.execute(`SELECT COUNT(username) AS usernameCount FROM tbl_user WHERE username=?`, [username]) as any;
    const emailResponse = await con.execute(`SELECT COUNT(email) AS emailCount FROM tbl_user WHERE email=?`, [email]) as any;
    con.end();

    const usernameCount = usernameResponse.at(0).at(0).usernameCount;
    const emailCount = emailResponse.at(0).at(0).emailCount;

    const dbValidationErr: Array<string> = [];
    if (usernameCount !== 0) dbValidationErr.push('username taken');
    if (emailCount !== 0) dbValidationErr.push('email taken');

    if (dbValidationErr.length !== 0) {
        res.status(401).send(new RegistrationResponse(false, dbValidationErr));
        return;
    }

    con = await getConnection();
    try {
        const response = await con.execute('INSERT INTO tbl_user (username, password, email) VALUES (?,?,?)', [username, encrypt(password), email]) as any;
        res.status(200).send(new RegistrationResponse(true));
    } catch (err: any) {
        res.status(500).send(new RegistrationResponse(false, ['something went wrong registering you?! ' + err.message]));
    } finally {
        con.end();
    }

    next();
}

/**
 * Express Middleware: Allows only authorized calls to this API.
 */
function authenticateRequestSource(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.get('Authorization');
    if (authorizationHeader !== 'Bearer ' + process.env.REQUESTOR) {
        res.statusCode = 401;
        res.send({ error: 'You are not authorized.' })
        return;
    }
    next();
}

/**
 * Express Middleware: Checks a username and password provided in post body against DB and if correct, sets a JWT token into a cookie on users
 * browser.
 * @param req 
 * @param res 
 * @param next 
 */
async function login(req: Request, res: Response, next: NextFunction) {

    let success: boolean = false;
    let token: string | undefined;
    let error: Array<string> = [];
    const { username, password: passwordFromForm } = req.body;

    console.log('un: ' + username + ' pw: ' + passwordFromForm);

    if (username && passwordFromForm) {

        // query db for user data
        const con = await getConnection();
        const result = await con.execute('SELECT user_id, password, email FROM tbl_user WHERE username=?', [username]) as any;
        con.end();
        const { user_id, password: passwordFromDb, email } = result[0][0];

        // check if passwords match by encrypting form password with db passwords salt and checking equality
        const correct = checkPasswordCorrect(passwordFromDb, passwordFromForm);
        if (correct) {
            success = true;
            token = createToken(user_id, username, email);
        }
    } else {
        // validate post body properties
        if (!username) error.push('no username provided');
        if (!passwordFromForm) error.push('no password provided');
    }

    // prepare response
    res.set('Content-Type', 'application/json');

    console.log('---------------------------\nAUTH/LOGIN/ login() - \nSUCCESS: ' + success + '\nTOKEN: ' + token + '\nERROR: ' + error + '\n---------------------------');

    // send json response
    res.status((error.length === 0) ? 200 : 401).json(new LoginResponse(success, token, error));
}

export default auth;