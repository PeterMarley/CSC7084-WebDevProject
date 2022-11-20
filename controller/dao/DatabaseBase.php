<?php
require_once '../../inc/Logger.php';
require_once 'DatabaseConfig.php';

class DatabaseBase {

    // logger for database API
    protected $logger;
 
    /**
     * __construct
     * Construct an DatabaseBase object which will allow communication with the MariaDB database
     * @param ILogger $iLogger ILogger implementing object
     * @throws InvalidArgumentException if  $iLogger param does not implement iLogger
     * @return DatabaseBase      
     */
    protected function __construct($iLogger) {
        if (!($iLogger instanceof ILogger)) {
            throw new InvalidArgumentException('$iLogger param must implement ILogger');
        }

        // set logger
        $this->logger = $iLogger;

        // test connection
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if (mysqli_connect_errno()) {
            // report connection failure
            $failureMsg = 'DB Connection Failed!';
            //$this->logger->log($failureMsg);
            throw new Exception($failureMsg);
        }

        // report connection success
        //$successMsg = 'DB Connection success!';
        //$this->logger->log($successMsg);
    }
    
    /**
     * getConnection
     *
     * @return mysqli 
     */
    protected function getConnection() {
        return new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    } 
}
