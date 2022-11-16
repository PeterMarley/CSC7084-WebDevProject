<?php

const DB_NAME = 'moodr';
const DB_USER = 'moodr_app';
const DB_PASS = 'h8iGJbu8pLzG2N5';
const DB_HOST = 'localhost';

// $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// if ($conn->connect_error) {
//     die('DB connection failure');
// }

// echo '<script>console.log("db connection successful")</script>';

include 'controller/utility.php';

class DatabaseApi {

    protected $conn;

    public function __construct() {
        
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if (mysqli_connect_errno()) {
            $failureMsg = 'DB Connection Failed!';
            consoleLog($failureMsg);
            throw new Exception($failureMsg);
        }
        $successMsg = 'DB Connection success!';
        consoleLog($successMsg);
    }

    public function checkPassword($username, $password) {
        //consoleLog($username . ' ' . $password);
        $stmt = $this->conn->query("SELECT fn_Check_Password('$username', '$password')");
        if ($stmt) {
            $result = $stmt->fetch_assoc();
            //consoleLog('result: '. implode(',',$result));
            return $result;
        }
        return 'Password Check Failed!';
    }

    public function select($table, $attributes) {
        $attrStr = implode(',', $attributes);
        
        $stmt = $this->conn->prepare('SELECT (?) FROM ' . $table);
        $stmt->bind_param(str_repeat('s', count($attributes)), $attrStr);

        $stmt->execute();

        return $stmt->get_result()->fetch_array(MYSQLI_ASSOC);

        $statement = $this->execute('SELECT * FROM ' . $table);
        return $statement->get_result()->fetch_all(MYSQLI_ASSOC);

        return $attrStr;
    }

    private function execute($sqlString, $params = []) {
        $statement = $this->conn->prepare($sqlString);
        if (!$statement) {
            throw new Exception('statement creation failed');
        }
        if ($params) {
            if ($statement->bind_param(...$params)) {
                throw new Exception('statment parameter binding failed');
            }
        }
        $statement->execute();
        return $statement;
    }
}
