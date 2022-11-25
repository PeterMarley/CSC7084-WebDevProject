const express = require('express');
const formParser = require('body-parser').urlencoded();
const mysql = require('mysql');
const db = express.Router();

db.post('/checkpassword', formParser, (req, res) => {
  if (req.body.username && req.body.password) {
    const { username, password } = req.body;
  }
  con = getConnection();
  con.query('SELECT fn_Check_Password_Login(?,?)', [req.body.username, req.body.password] ,function(error, results, fields){
    if (error) throw error;
    for (const result of results) {
      console.log('The solution is: ', results[0]);
    }
  });
  con.end();
  res.sendStatus(200);
});


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

module.exports = db;