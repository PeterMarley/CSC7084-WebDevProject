<?php
require_once 'lib/class/DatabaseUser.php';

function login($username, $password) {
  $db = new DatabaseUser();
  $return = $db->checkPassword($username, $password);

  if ($return) {
    $time = time();
    $expires = session_length($time);
    session_id();
    $_SESSION['username'] = $username;
    $_SESSION['password'] = $return;
    $_SESSION['timestamp-start'] = $time;
    $_SESSION['timestamp-end'] = $expires;
    $_SESSION['session_id'] = session_id();
    // setcookie("logged-in", true, $expires, '/');
  } else {
    session_destroy();
  }

  return $return == true;
}

function logout() {
  session_destroy();
  setcookie("PHPSESSID", false, 0, '/');
}

function register($username, $password)
{
  $db = new DatabaseUser();
  $db->register($username, $password);
}

function session_length($time) {
  //return $time+10;
  return $time+60*60*24*1;
}

function is_logged_in() {
  return isset($_COOKIE['PHPSESSID']) && isset($_SESSION['timestamp-end']) && $_SESSION['timestamp-end'] > time();
}