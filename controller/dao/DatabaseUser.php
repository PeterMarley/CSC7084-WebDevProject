<?php
require_once('DatabaseBase.php');

class DatabaseUser extends DatabaseBase {
  function __construct($iLogger) {
    parent::__construct($iLogger);
  }

    /**
   * checkPassword using a prepared statement
   *
   * @param  string $username user's username attempt
   * @param  string $password user's password attempt
   * @return boolean true if username password combination is correct, or false otherwise
   */
  public function checkPassword($username, $password) {
    // validate parameter types
    if (gettype($username) != 'string' || gettype($password) != 'string') {
        // console log string as throwing an exception and not catching it may expose passwords typed in
        $this->logger->log('checkPassword() parameters invalid: params must both be strings');
        return false;
    }
    $mysqli = $this->getConnection();

    // open connection and prepare statement
    $stmt = $mysqli->prepare("SELECT fn_Check_Password(?, ?)");
    $stmt->bind_param('ss', $username, $password);

    // execute SQL and return result
    $stmt->execute();
    $result = $stmt->get_result(); 

    if (!$result) { return false; } 

    return $result->fetch_array(MYSQLI_NUM)[0] === 1;
  }  
}