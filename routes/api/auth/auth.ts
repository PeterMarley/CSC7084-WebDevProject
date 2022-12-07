import express from 'express';
import mysql from 'mysql2/promise';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
import checkPasswordCorrect from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
import getConnection from '../../../lib/dbConnection';

const auth = express.Router();

/*
API DESCRIPTION

- post username and password to api, get token back?
- require a website token perhaps to limit outside access?
    - this token can live in .env file/ environment variables
*/
auth.use(express.urlencoded({ extended: false }));

// auth.use(authenticateRequestSource);


auth.post('/login', loginMiddleware);

// function authenticateRequestSource(req: express.Request, res: express.Response, next: express.NextFunction) {
//     if (req.body && req.body.requestor === process.env.REQUESTOR) {
//         next();
//     } else {
//         res.sendStatus(401);
//     }
// }

async function loginMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {

    const { username, password } = req.body;
    const correct = checkPasswordCorrect(await queryUserPassword(username), password);
 
    let success: boolean = false;
    let token: string | null = null;

    if (correct) {
        success = true;
        token = createToken(username)
    } else {
        success = false;
    }

    res.set('Content-Type', 'application/json');
    res.send(new LoginResponse(success, token));
}

async function queryUserPassword(username: string): Promise<string> {
    const con = await getConnection();
    const result = await con.execute('SELECT password FROM tbl_user WHERE username=?', [username]) as any;
    console.dir(result);
    // return result[0][0].password;
    return Promise.resolve('yo');
}

export default auth;