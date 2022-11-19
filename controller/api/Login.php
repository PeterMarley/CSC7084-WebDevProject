<?php
require_once('../../global.php');
require_once('../dao/DatabaseUser.php');
//$logger = new Logger();

$db = new DatabaseUser(new Logger());
if (!isset($_POST['username']) || !isset($_POST['password'])) {
  throw new Exception('nah mate');
}

$loginSuccessful = $db->checkPassword($_POST['username'], $_POST['password']);

if ($loginSuccessful) {
  setcookie('ls', 1, 0, '/');
  setcookie('un', $_POST['username'], 0, '/');
  setcookie('pw', $_POST['password'], 0, '/');
} else {
  setcookie('ls', 0, 0, '/');
}

header('Location: ../../' . $_GET['redirect']);