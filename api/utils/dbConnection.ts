import mysql2 from 'mysql2/promise';

async function getConnection(): Promise<mysql2.Pool> {
  // const con = await mysql2.createConnection({
  //   host: process.env.MOODR_DB_HOST,
  //   user: process.env.MOODR_DB_USER,
  //   database: process.env.MOODR_DB_NAME,
  //   password: process.env.MOODR_DB_PASS
  // });
  // return con;
  const pool = mysql2.createPool({
    host: process.env.MOODR_DB_HOST,
    user: process.env.MOODR_DB_USER,
    database: process.env.MOODR_DB_NAME,
    password: process.env.MOODR_DB_PASS
  });
  return pool
}

//module.exports = getConnection;
export default getConnection;