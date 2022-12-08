import express, { Request, Response, NextFunction } from 'express';
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

async function loginMiddleware(req: Request, res: Response, next: NextFunction) {

    let success: boolean = false;
    let token: string | undefined;
    let error: Array<string> = [];
    const { username, password } = req.body;

    if (username && password) {
        const { id, passwordFromDb, email } = await queryUserPassword(username);
        const correct = checkPasswordCorrect(passwordFromDb, password);
        if (correct) {
            success = true;
            token = createToken(id, username, email);
        }
    } else {
        if (!username) error.push('no username provided');
        if (!password) error.push('no password provided');
    }
    res.set('Content-Type', 'application/json');
    res.send(new LoginResponse(success, token, error));
}

async function queryUserPassword(username: string): Promise<PasswordQueryResponse> {
    const con = await getConnection();
    const result = await con.execute('SELECT user_id, password, email FROM tbl_user WHERE username=?', [username]) as any;
    con.end();
    return new PasswordQueryResponse(result[0][0].user_id, result[0][0].password, result[0][0].email);
}

class PasswordQueryResponse {
    id: number;
    passwordFromDb: string;
    email: string;

    constructor(id: number, password: string, email: string) {
        this.id = id;
        this.passwordFromDb = password;
        this.email = email;
    }
}

export default auth;