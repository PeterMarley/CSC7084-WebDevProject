<?php

/*****************************
 *  CONSTANTS
 *****************************/
define('LOGIN_URL', 'https://localhost/uni/project/controller/api/Login.php');
define('HOME', 'uni/project');

define('LOCALHOST', 'https://localhost');

// used in the http-controller.php
define('PHP_TEMPLATES', 'view/templates/');

/*****************************
 *  Path Builder functions
 *****************************/
  
/**
 * Builds an absolute server path
 *
 * @param  string $path
 * @return string absolute server path to a file
 */
function buildPathAbsolute($path) {
  return $_SERVER['DOCUMENT_ROOT'] . '/' . HOME . $path;
}

/**
 * Builds a relative server path
 *
 * @param  string $path
 * @return string relative server path to a file
 */
function buildPathRelative($path) {
  return '/' . HOME . $path;
}
