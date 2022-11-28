import mysql from 'mysql';

/**
 * 
 * @param {*} multipleStatements 
 * @returns mysqli.Connection
 */
function getConnection(multipleStatements = false) {
  const connection = mysql.createConnection({
    host: process.env.MOODR_DB_HOST,
    user: process.env.MOODR_DB_USER,
    password: process.env.MOODR_DB_PASS,
    database: process.env.MOODR_DB_NAME,
    multipleStatements: multipleStatements
  });
  connection.connect();
  return connection;
}

//module.exports = getConnection;
export default getConnection;