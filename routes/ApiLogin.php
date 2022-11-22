<?php
require_once '../api/DatabaseUser.php';
require_once 'LoginResponse.php';

$db = new DatabaseUser();

if (!isset($_POST['username'])|| !isset($_POST['password'])) {
  throw new Exception('post body invalid');
}

$checkReturn = $db->checkPassword($_POST['username'], $_POST['password']);

session_start();

// if ($checkReturn) {
//   $_SESSION['username'] = $_POST['username'];
//   $_SESSION['password'] = $_POST['password'];
//   $_SESSION['login-success'] = true;
//   setcookie('login-success', true, 0, '/');
// } else {
//   $_SESSION['login-success'] = false;
//   setcookie('login-success', false, 0, '/');
// }

header('Content-Type: application/json');
echo json_encode(new LoginResponse($checkReturn, $_POST['username']));