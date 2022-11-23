<?php
require_once 'DatabaseConfig.php';

class DatabaseBase {
 
    /**
     * __construct
     * Construct an DatabaseBase object which will allow communication with the MariaDB database
     * @param ILogger $iLogger ILogger implementing object
     * @throws mysqli_sql_exception if database connection fails
     */
    protected function __construct() {
        // test connection
        $this->conn = $this->getConnection();
        if (mysqli_connect_errno()) {
            throw new mysqli_sql_exception('DB Connection Failed!');
        }
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
