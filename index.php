<?php
/**
 * This is the routing controller of the Moodr mood tracking web application
 */

 
include_once('inc/bootstrap.php');

$uri = array_filter(explode( '/', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)));

$uri = array_filter($uri, function($element) {
  return $element == true;
});
$startpointPath =  array_slice($uri,0,array_search(INDEX, $uri, true) - 1);
$endpointPath = array_slice($uri, array_search(INDEX, $uri, true));
echo 'start: '. print_r($startpointPath, true) . '<br>';
echo 'end: '. print_r($endpointPath, true) . '<br>';
echo 'implode: '. implode('\\',$startpointPath) . '<br>';
echo 'DIR: '.  __DIR__ . '<BR>';
echo __DIR__ .  '\view\templates\template.php<br>';

// C:\xampp\htdocs\uni\project\view\templates

$route = implode('/', $endpointPath);
// echo 'route: '. $route . '<br>';
// echo 'HOME_PATH: '. HOME_PATH . '<br>';

switch ($route) {
  case HOME_PATH:
  case "":
    include('view/templates/template.php');
    //header('Location: view/templates/template.php');
    break;
  case "test":
    include('view/templates/test.php');
    break;
  default:
    echo 'Route not recognised: '. $route . '<br>';
}

// exit;

// if (count($endpointPath) === 0) {
//   include('view/templates/template.php');
// } else if (isset($endpointPath[0])) {

//   // first stage route
//   switch ($endpointPath[0]) {
//     case 'test':
//       header('Location: '.THE_PATH.'test.html');
//       break;
//   }
//   echo $endpointPath[0];
// }

// var_dump($endpointPath);

// if ((isset($uri[2]) && $uri[2] != 'user') || !isset($uri[3])) {
//     header("HTTP/1.1 404 Not Found");
//     exit();
// }



