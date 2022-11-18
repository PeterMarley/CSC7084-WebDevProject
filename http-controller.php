<!DOCTYPE html>
<?php
/**
 * This is the routing controller of the Moodr mood tracking web application
 * this script is specified as the FallbackResource in httpd.conf
 */

require('inc/bootstrap.php');
include_once('inc/Logger.php');

$logger = new Logger();
$logger->log($_SERVER['REQUEST_URI']);

switch ($_SERVER['REQUEST_URI']) {
  case "/test":
    renderTemplate('test.php');
    break;
  default:
    renderTemplate('template.php');
}

function renderTemplate($filename) {
  include(PHP_TEMPLATES . $filename);
}




