<?php

class Router {
  
  private static $router;
  private $allowedHttpMethod = ["GET", "POST"];
  
  private function __construct()
  {
    echo '<div>dan san</div>';
  }

  public static function getInstance() {
    if (Router::$router == null) {
      Router::$router = new Router();
    }
    return Router::$router;
  }

  public function __call($name, $args) {
    if (!in_array(strtoupper($name), $this->allowedHttpMethod)) {
      throw new InvalidArgumentException('invalid http method used');
    }
    print_r($args);
    // echo '<div>call was called</div>';
    // echo '<div>name: '.$name.'</div>';
    // echo '<div>args: '.$args.'</div>';
  }
}