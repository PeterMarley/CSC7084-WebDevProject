<?php

class ReauthResponse {
  public $success;

  public function __construct($success) {
    $this->success = $success;
  }
}

class LoginResponse {
  public $success;
  public $reason;

  function __construct($success, $reason) {
    $this->success = $success;
    $this->reason = $reason;
  }
}

class LogoutResponse {
  public $success;
  public $wasLoggedIn;

  function __construct($wasLoggedIn) {
    $this->success = true;
    $this->wasLoggedIn = $wasLoggedIn;
  }
}

