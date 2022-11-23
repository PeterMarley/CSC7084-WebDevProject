<?php
class LoginResponse {
  public $username;
  public $encryptedPassword;

  function __construct($encryptedPassword, $username = '') {
    $this->encryptedPassword = $encryptedPassword;
    $this->username = $username;
  }
}