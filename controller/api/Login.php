<?php
require_once('../../global.php');
require_once('../dao/DatabaseUser.php');

$logger = new Logger();
$db = new DatabaseUser($logger);

var_dump($_POST);

if (!isset($_POST['username']) 
    || !isset($_POST['password'])
    || !isset($_POST['redirect'])
    || !isset($_POST['login-submit'])) {
  throw new Exception('nah mate');
}

$loginSuccessful = $db->checkPassword($_POST['username'], $_POST['password']);


session_start();

if ($loginSuccessful) {
  $_SESSION['username'] = $_POST['username'];
  $_SESSION['password'] = $_POST['password'];
  $_SESSION['login-success'] = true;
} else {
  $_SESSION['login-success'] = false;
}

//header('Location: ../../' . $_POST['redirect']);