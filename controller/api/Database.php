<?php

const DB_NAME = 'moodr';
const DB_USER = 'moodr_app';
const DB_PASS = 'h8iGJbu8pLzG2N5';
const DB_HOST = 'localhost';

require 'controller/Logger.php';

class DatabaseApi {

    // database mysqli object / connection
    protected $conn;
    // logger for database API
    private $logger;

        
    /**
     * __construct
     * Construct an DatabaseApi object which will allow communication with the MariaDB database
     *
     * @return DatabaseApi
     */
    public function __construct($logDestination = 'console') {
        $this->logger = new Logger($logDestination);
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if (mysqli_connect_errno()) {
            $failureMsg = 'DB Connection Failed!';
            $this->logger->log($failureMsg);
            throw new Exception($failureMsg);
        }
        $successMsg = 'DB Connection success!';
        $this->logger->log($successMsg);
    }

        
    /**
     * checkPassword
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
        
        // prepare statement
        $stmt = $this->conn->prepare("SELECT fn_Check_Password(?, ?)");
        $stmt->bind_param('ss', $username, $password);
        $stmt->execute();
        return $stmt->get_result()->fetch_array(MYSQLI_NUM)[0] == true;
    }

    public function createNewUser($username, $password) {

    }

}
