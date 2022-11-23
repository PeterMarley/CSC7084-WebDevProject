<?php
require_once 'controller/DatabaseUser.php';

function login($username, $password) {
  $db = new DatabaseUser();
  $return = $db->checkPassword($username, $password);

  if ($return) {
    $time = time();
    $expires = $time+60*60*24*1;
    session_id();
    $_SESSION['username'] = $username;
    $_SESSION['password'] = $return;
    $_SESSION['timestamp-start'] = $time;
    $_SESSION['timestamp-end'] = $expires;
    $_SESSION['session_id'] = session_id();
    setcookie("logged-in", true, $expires, '/');
  } else {
    session_destroy();
  }

  return $return == true;
}

function logout() {
  session_destroy();
  setcookie("logged-in", false, 0, '/');
}

