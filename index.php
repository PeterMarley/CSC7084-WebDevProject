<!DOCTYPE html>

<?php

require_once('global.php');
require_once('inc/Logger.php');
$logger = new Logger();
$logger->log($_SERVER['REQUEST_URI']);

switch ($_SERVER['REQUEST_URI']) {
  
  case "/test":
    renderTemplate('test.php');
    break;

  case "/home":
  default:
    renderTemplate('template.php');

}

function renderTemplate($filename) {
  include(PHP_TEMPLATES . $filename);
}




