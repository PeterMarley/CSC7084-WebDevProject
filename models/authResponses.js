class LoginResponse {
  constructor(err) {
    this.err = err;
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