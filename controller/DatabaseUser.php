<?php
require_once('DatabaseBase.php');

class DatabaseUser extends DatabaseBase {
  function __construct() {
    parent::__construct();
  }

  public function register($username, $password) {
    if (gettype($username) != 'string' || gettype($password) != 'string') {
      return;
    }

    $mysqli = $this->getConnection();
    $stmt = $mysqli->prepare('CALL usp_Create_User(?, ?)');
    $stmt->bind_param('ss', $username, $password);

    $stmt->execute();
  }

    /**
   * checkPassword using a prepared statement
   *
   * @param  string $username user's username attempt
   * @param  string $password user's password attempt
   * @return integer false if password is incorrect, otherwise the salted and hashed password is returned
   */
  public function checkPassword($username, $password) {
    // validate parameter types
    if (gettype($username) != 'string' || gettype($password) != 'string') {
        // console log string as throwing an exception and not catching it may expose passwords typed in
        return false;
    }

    // open connection and prepare statement
    $mysqli = $this->getConnection();
    $stmt = $mysqli->prepare("SELECT fn_Check_Password_Login(?, ?)");
    $stmt->bind_param('ss', $username, $password);

    // execute SQL and return result
    $stmt->execute();
    $result = $stmt->get_result(); 

    if (!$result) return false; 

    $result = $result->fetch_array(MYSQLI_NUM)[0];

    if ($result == '0') {
      return false;
    }

    return $result;
  }  
}