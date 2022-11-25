class LoginResponse {
  constructor(token = 0) {
    this.success = token == 1;
  }
}

class AuthResponse {
  constructor(success) {
    this.success = success;
  }
}

/**
 * token instead of pw
 * event listener for json response
 */

module.exports = { LoginResponse, AuthResponse };