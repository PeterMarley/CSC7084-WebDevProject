<?php
class Routing {
  public static function redirect() {
    return isset($_POST['redirect']) ? $_POST['redirect'] : '/';
  }
}
