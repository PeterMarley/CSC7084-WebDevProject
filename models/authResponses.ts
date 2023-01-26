export class LoginResponse {
  err: string[];
  constructor(err: string[]) {
    this.err = err;
  }
}

export class AuthResponse {
  success: boolean;
  constructor(success: boolean) {
    this.success = success;
  }
}

export class RegistrationResponse {
  success: boolean;
  error: string;
  constructor(success: boolean, error: string) {
    this.success = success;
    this.error = error;
  }
}

export class AccountDetailsUpdateResponse {
    emailValid: boolean;
    usernameValid: boolean;
    constructor(usernameValid: boolean, emailValid: boolean) {
        this.emailValid = emailValid;
        this.usernameValid = usernameValid;
    }
}