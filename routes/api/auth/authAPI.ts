import express, { Request, Response, NextFunction } from 'express';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
import checkPasswordCorrect from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
import RegistrationResponse from '../../../models/RegistrationResponse';
import getConnection from '../../../lib/dbConnection';
import PasswordQueryResponse from '../../../models/PasswordQueryResponse';
import { 
    AccountDetailsUpdateResponse, 
    AccountDetailsGetResponse, 
    AccountPasswordUpdateResponse,
    DeleteAccountResponse
} from './authApiModel';
import { encrypt } from '../../../lib/crypt';
import { JwtPayload } from 'jsonwebtoken';
import { format } from 'mysql2';
import { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
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

authAPI.delete('/deleteuser', deleteUserAccount);

authAPI.get('/userdetails/:userId', getAccountDetails);
authAPI.put('/userdetails/:userId', updateAccountDetails);
authAPI.patch('/userdetails/:userId/password', accountPasswordPatch);
/*******************************************************
 * 
 * MIDDLEWEAR
 * 
 *******************************************************/

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

async function accountPasswordPatch(req: Request, res: Response, next: NextFunction) {
    // const sql = "SELECT username, email FROM tbl_user WHERE user_id=?";
    const userId = Number(req.params.userId);
    const { password } = req.body;
    console.log(`new password: \"${password}\"`);

    // const passwordNew = req.body['password-new'];
    // const passwordNewConfirm = req.body['password-new-confirm'];
    // const passwordOld = req.body['password-old'];
    // console.log(`old password: \"${passwordOld}\"`);
    // console.log(`new password: \"${passwordNew}\"`);
    // console.log(`new password confirm: \"${passwordNewConfirm}\"`);
    
    let success = false;

    try {
        if (validatePassword(password)) {
            const updateAccountDetailsSql = format(`CALL usp_update_password(?,?)`, [userId, encrypt(password)]);
            const con = await getConnection();

            success = ((await con.execute(updateAccountDetailsSql)).at(0) as ResultSetHeader).affectedRows === 1;

            con.end();
        }
    } catch (err) {
        console.log('updating account password failed.');
    }

    res.json(new AccountPasswordUpdateResponse(success));
}



async function updateAccountDetails(req: Request, res: Response, next: NextFunction) {
    // const sql = "SELECT username, email FROM tbl_user WHERE user_id=?";
    const userId = Number(req.params.userId);
    const { username, email } = req.body;

    let success = false;

    try {
        if (validateUsername(username) && validateEmail(email)) {
            const updateAccountDetailsSql = format(`UPDATE tbl_user u SET u.username = ?, u.email=? WHERE u.user_id = ?`, [username, email, userId]);
            const con = await getConnection();
            success = ((await con.execute(updateAccountDetailsSql)).at(0) as ResultSetHeader).affectedRows === 1;
            con.end();
        }
    } catch (err) {
        console.log('updating account details failed:');
        console.log(`userId: ${userId}, new username: ${username}, new email: ${email}`);
    }

    res.json(new AccountDetailsUpdateResponse(success, userId, username, email));
}

async function getAccountDetails(req: Request, res: Response, next: NextFunction) {

    const { userId } = req.params;

    const formattedSql = format("SELECT username, email FROM tbl_user WHERE user_id=?", [userId]);

    const con = await getConnection();
    const response = ((await con.execute(formattedSql)).at(0) as RowDataPacket).at(0) as AccountDetailsGetResponse;
    con.end();

    res.json(response);
}

async function deleteUserAccount(req: Request, res: Response, next: NextFunction) {
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

        const sql = format(SQL.register.insertUser, [username, encrypt(password), email]);
        // console.log(sql);
        
        const insertUserResult = await con.execute(sql) as any;

        const userId: number = insertUserResult.at(0).insertId;

        // const insertMoodsResult = await con.execute(SQL.register.insertMoods, Array(5).fill(userId)) as any;

        const insertActivityGroupsResult = await con.execute(SQL.register.insertActivityGroups, [userId]) as any;
        const activityGroupId: number = insertActivityGroupsResult.at(0).insertId;

        const insertDefaultActivitiesResult = await con.execute(SQL.register.insertDefaultActivities, [activityGroupId, userId, activityGroupId, userId]) as any;


        res.status(200).send(new RegistrationResponse(true));
        return;
    } catch (err: any) {
        console.log(err);
        res.status(500).send(new RegistrationResponse(false, ['something went wrong registering you?! ' + err.message]));
        return;
    } finally {
        con.end();
    }
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

/*******************************************************
 * 
 * UTILITY AND VALIDATION
 * 
 *******************************************************/

function validatePassword(password: string) {
    //TODO actual password validation
    return true;
}

function validateUsername(username: string): boolean {
    if (!username) return false;
    return /[a-zA-Z0-9]{8,15}/.test(username);
}

function validateEmail(email: string): boolean {
    if (!email) return false;
    // extremely basic email regex, suitable for the purposes of this project
    const emailRegex = /[a-zA-Z0-8]{1,}[@][a-zA-Z0-8]{1,}[\.][a-zA-Z0-8]{1,}/
    return emailRegex.test(email);
}
export default authAPI;