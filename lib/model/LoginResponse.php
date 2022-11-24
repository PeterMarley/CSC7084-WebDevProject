<?php
class LoginResponse {
  public $success;

  function __construct($success) {
    $this->success = $success;
  }
}