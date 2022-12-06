import express from 'express';
import getConnection from '../../../lib/dbConnection';
import mysql, {MysqlError, FieldInfo, Query} from 'mysql';

const auth = express.Router();

/*
API DESCRIPTION

- post username and password to api, get token back?
- require a website token perhaps to limit outside access?
    - this token can live in .env file/ environment variables
*/
auth.use(express.urlencoded({extended: false}));

auth.post('/login', (req, res, next) => {
    res.set('Content-Type', 'application/json')
    console.dir(req.body);
    login(req.body.username, req.body.password);
    res.send(JSON.stringify({reqBody: req.body}));
});

function login(username: string, password: string, res: express.Response | null = null) {
	// get db connection and execute function to check password is correct
	const con = getConnection();
    let query: Query = con.query('SELECT fn_Check_Password(?,?) AS passwordCorrect', [username, password], (error: MysqlError | null, results: any) => {
            if (error) throw error;
        
            const result = results[0].passwordCorrect;
        
            // if password correct set token cookie to jwt and set express local var to username
            let ok;
            if (result) {
                // res.locals.username = username;
                // res.locals.authed = true;
                // res.cookie('token', createToken(username));
                ok = true;
            } else {
                ok = false;
            }
            return ok;
        }
	);
    // query.on('result', () => {
    //     console.log('it is done');
        
    // });
	con.end(); // close connection
    console.dir(query);
    
}

export default auth;