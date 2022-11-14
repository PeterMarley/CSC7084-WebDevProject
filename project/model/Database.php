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

class Database {
    protected $conn;

    public function __construct() {
        
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if (mysqli_connect_errno()) {
            throw new Exception('DB Connection Failed!');
        }
    }

    public function select($table, $attributes) {
        $attrStr = implode(',', $attributes);
        
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
