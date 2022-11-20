<?php
class LoginResponse {
  public $encryptedPassword;
  public $username;

  function __construct($encryptedPassword, $username = '') {
    $this->encryptedPassword = $encryptedPassword;
    $this->username = $username;
  }
}