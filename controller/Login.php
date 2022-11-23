<?php
require_once 'controller/DatabaseUser.php';

function login($username, $password) {
  $db = new DatabaseUser();
  $return = $db->checkPassword($username, $password);

  if ($return) {
    $_SESSION['username'] = $username;
    $_SESSION['password'] = $return;
    $_SESSION['timestamp'] = time();
  } else {
    session_destroy();
  }

  return $return == true;
}

// header('Content-Type: application/json');
// echo json_encode(array("success"=>$success));