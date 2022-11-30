class LoginResponse {
  err: string[];
  constructor(err: string[]) {
    this.err = err;
  }
}

class AuthResponse {
  success: boolean;
  constructor(success: boolean) {
    this.success = success;
  }
}

class RegistrationResponse {
  success: boolean;
  error: string;
  constructor(success: boolean, error: string) {
    this.success = success;
    this.error = error;
  }
}

/**
 * token instead of pw
 * event listener for json response
 */

//module.exports = { LoginResponse, AuthResponse, RegistrationResponse };
export { LoginResponse, AuthResponse, RegistrationResponse };