class CheckPasswordResponse {
  
  constructor(token = 0) {
    this.success = token == 1;
    // this.success = inp !== '0' ? true : false;
    // this.pw = inp;
  }
}

/**
 * token instead of pw
 * event listener for json response
 */

module.exports = CheckPasswordResponse;