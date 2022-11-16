<?php

class Router {
  function __construct()
  {
    echo 'dan san';
  }

  public function __call($name, $args) {
    echo 'call was called';
  }
}