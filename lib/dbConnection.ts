import mysql2, { Connection } from 'mysql2';

async function getConnection(): Promise<Connection> {
  const con = await mysql2.createConnection({
    host: process.env.MOODR_DB_HOST,
    user: process.env.MOODR_DB_USER,
    database: process.env.MOODR_DB_NAME,
    password: process.env.MOODR_DB_PASS
  });
  return con;
}

//module.exports = getConnection;
export default getConnection;