const CheckPasswordResponse = require('../authResponses.js');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

function loginHandler(req, res, next) {
  
  // validate
  if (!req.body.username || !req.body.password) {
    res.status(400).json(new CheckPasswordResponse());
    return;
  }

  const { username, password } = req.body;
  con = getConnection();
  con.query('SELECT fn_Check_Password(?,?) AS checkResult', [username, password] ,function(error, results, fields){
    if (error) throw error;
    const result = results[0].checkResult;
    req.session.token = 'token here';
    token = createToken(username);
    console.log(token);
    console.log(authenticateToken(token));
    console.log(new Date(token.expiry));
    res.status(200).json(new CheckPasswordResponse(result));
  });
  con.end();
}

function createToken(username) {
  data = {
    expiry: Date.now() + (1000 * 60 * 60),
    username
  }
  return jwt.sign(data, process.env.MOODR_SESSION_KEY);
}

function authenticateToken(token) {
  return jwt.verify(token, process.env.MOODR_SESSION_KEY)
}

function getConnection() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MOODR_DB_USER,
    password: process.env.MOODR_DB_PASS,
    database: process.env.MOODR_DB_NAME
  });
  connection.connect();
  return connection;
}

module.exports = loginHandler;