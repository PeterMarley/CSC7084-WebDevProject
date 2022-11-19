<?php
require_once('../../global.php');
require_once('../dao/DatabaseUser.php');
$logger = new Logger();

$db = new DatabaseUser(new Logger());
if (!isset($_POST['username']) || !isset($_POST['password'])) {
  throw new Exception('nah mate');
}

$loginSuccessful = $db->checkPassword($_POST['username'], $_POST['password']);

if ($loginSuccessful) {
  setcookie('ls', 1);
  setcookie('un', $_POST['username']);
  setcookie('pw', $_POST['password']);
}

header('Location: ' . buildPathAbsolute($_GET['redirect']));