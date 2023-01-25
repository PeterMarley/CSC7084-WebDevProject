import express, { Request, Response, NextFunction } from 'express';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
import checkPasswordCorrect from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
import RegistrationResponse from '../../../models/RegistrationResponse';
import getConnection from '../../../lib/dbConnection';
import PasswordQueryResponse from '../../../models/PasswordQueryResponse';
import { encrypt } from '../../../lib/crypt';
import { JwtPayload } from 'jsonwebtoken';
import { format } from 'mysql2';
const authAPI = express.Router();

/*
API DESCRIPTION

- post username and password to api, get token back?
- require a website token perhaps to limit outside access?
        - this token can live in .env file/ environment variables
*/
authAPI.use(express.urlencoded({ extended: false }));
// authAPI.use(authenticateRequestSource);

/*******************************************************
 * 
 * ROUTES
 * 
 *******************************************************/

authAPI.post('/login', login);
authAPI.post('/register', register);
authAPI.delete('/deleteuser', deleteuser);
authAPI.get('/userdetails/:userId', accountGet);
/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/
async function accountGet(req: Request, res: Response, next: NextFunction) {
    const sql = "SELECT username, email FROM tbl_user WHERE user_id=?";
    const {userId} = req.params;
    const formattedSql = format(sql, [userId]);
    const con = await getConnection();
    const response = ((await con.execute(formattedSql))[0] as Array<any>)[0];
    res.json(response);
}


async function deleteuser(req: Request, res: Response, next: NextFunction) {
    let success = false;
    let error: string | undefined;
    if (req.body && req.body.confirmation && res.locals.authed) {
        try {
            const token: JwtPayload = verifyToken(req.cookies.token)
            const con = await getConnection();
            //TODO more probably needed here
            con.execute('DELETE FROM tbl_activity WHERE user_id=?', [token.id]);
            con.execute('DELETE FROM tbl_activity_group WHERE user_id=?', [token.id]);
            con.execute('DELETE FROM tbl_mood WHERE user_id=?', [token.id]);
            con.execute('DELETE FROM tbl_user WHERE username=? AND user_id=? AND email=?', [token.username, token.id, token.email]);
            con.end();
            success = true;
        } catch (err: any) {
            error = err.message as string;
        }
    }
    res.send(new DeleteAccountResponse(success, error));
}

class DeleteAccountResponse {
    success: boolean;
    error: string | undefined;
    constructor(success: boolean, error: string | undefined = undefined) {
        this.success = success;
        if (error) this.error = error;
    }
}

const SQL = {
    register: {
        insertUser: 'INSERT INTO tbl_user (username, password, email) VALUES (?,?,?)',
        insertMoods:
            `INSERT INTO tbl_mood
            (
                tbl_mood.name, 
                tbl_mood.order, 
                tbl_mood.icon_image_id, 
                tbl_mood.user_id
            )
            VALUES 
            ('Awful', 1, 1, ?),
            ('Bad', 2, 2, ?),
            ('Ok', 3, 3, ?),
            ('Good', 4, 4, ?),
            ('Great', 5, 5, ?)`,
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

        const insertUserResult = await con.execute(SQL.register.insertUser, [username, encrypt(password), email]) as any;
        const userId: number = insertUserResult.at(0).insertId;

        const insertMoodsResult = await con.execute(SQL.register.insertMoods, Array(5).fill(userId)) as any;

        const insertActivityGroupsResult = await con.execute(SQL.register.insertActivityGroups, [userId]) as any;
        const activityGroupId: number = insertActivityGroupsResult.at(0).insertId;

        const insertDefaultActivitiesResult = await con.execute(SQL.register.insertDefaultActivities, [activityGroupId, userId, activityGroupId, userId]) as any;


        res.status(200).send(new RegistrationResponse(true));
    } catch (err: any) {
        res.status(500).send(new RegistrationResponse(false, ['something went wrong registering you?! ' + err.message]));
    } finally {
        con.end();
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
    if (username && passwordFromForm) {

        // query db for user data
        let con;
        try {
            con = await getConnection();
        } catch (err) {
            res.status(500).json(err);
            return;
        }
        const result = await con.execute('SELECT user_id, password, email FROM tbl_user WHERE username=?', [username]) as any;
        con.end();

        if (result[0][0] === undefined) {
            error.push('user does not exist');
        } else {
            // destructure data from DB resultset
            const { user_id, password: passwordFromDb, email } = result[0][0];

            // check if passwords match by encrypting form password with db passwords salt and checking equality
            if (checkPasswordCorrect(passwordFromDb, passwordFromForm)) {
                success = true;
                token = createToken(user_id, username, email);
            }
        }

    } else {
        // validate post body properties
        if (!username) error.push('no username provided');
        if (!passwordFromForm) error.push('no password provided');
    }

    // prepare and send json response
    res.set('Content-Type', 'application/json');
    res.status((error.length === 0) ? 200 : 401).json(new LoginResponse(success, token, error));
}

export default authAPI;