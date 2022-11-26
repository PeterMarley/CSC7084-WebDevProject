const mysql = require('mysql');

function getConnection(multipleStatements = false) {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MOODR_DB_USER,
    password: process.env.MOODR_DB_PASS,
    database: process.env.MOODR_DB_NAME,
    multipleStatements: multipleStatements
  });
  connection.connect();
  return connection;
}

module.exports = getConnection;