import express from 'express';
import mysql from 'mysql2/promise';
import { createToken, verifyToken } from '../../../lib/jwtHelpers';
// import sha256 from 'crypto-js/sha256';
import {check, encrypt, generateSalt} from '../../../lib/crypt';
import LoginResponse from '../../../models/LoginResponse';
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
    const passwordCorrect = await checkPassword(username, password);

    let success: boolean = false;
    let token: string | undefined;

    if (passwordCorrect) {
        success = true;
        token = createToken(username)
    }
    const x = encrypt(username);
    check(x, username);
    res.set('Content-Type', 'application/json');
    res.send(new LoginResponse(success, token));
}

async function checkPassword(username: string, password: string): Promise<boolean> {
    const con = await mysql.createConnection({
        host: process.env.MOODR_DB_HOST,
        user: process.env.MOODR_DB_USER,
        database: process.env.MOODR_DB_NAME,
        password: process.env.MOODR_DB_PASS
    });
    const result = await con.execute('SELECT fn_Check_Password(?,?) AS passwordCorrect', [username, password]) as any;
    return result[0][0].passwordCorrect === 1;
}



export default auth;