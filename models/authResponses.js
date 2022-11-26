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

class RegistrationResponse {
  constructor(success, error = null) {
    this.success = success;
    if (error) {
      this.error = error;
    }
  }
}

/**
 * token instead of pw
 * event listener for json response
 */

module.exports = { LoginResponse, AuthResponse, RegistrationResponse };