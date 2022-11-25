/******************************
 * 
 * Imports
 * 
 ******************************/

const CheckPasswordResponse = require('../../../models/authResponses.js');
const {createToken, verifyToken} = require('../../../lib/jwtHelpers.js');
const getConnection = require('../../../lib/dbConnection.js');

/******************************
 * 
 * Handler
 * 
 ******************************/

function loginHandler(req, res, next) {
  
  // validate post body contains required data
  if (!req.body.username || !req.body.password) {
    res.status(400).json(new CheckPasswordResponse());
    return;
  }

  // destructure post body into vars
  const { username, password } = req.body;

  // get db connection and execute function to check password is correct
  con = getConnection();
  con.query('SELECT fn_Check_Password(?,?) AS passwordCorrect', [username, password] ,function(error, results, fields){
    if (error) throw error;
    
    const result = results[0].passwordCorrect;

    // if password correct set token cookie to jwt
    if (result) {
      token = createToken(username);
      res.cookie('token', token);
    }
    //req.session.token = token;
    // console.log(token);
    // console.log(authenticateToken(token));
    // console.log(new Date(token.expiry));
    res.status(200).json(new CheckPasswordResponse(result));
  });
  con.end();
}

module.exports = loginHandler;