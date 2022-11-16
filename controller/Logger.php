<?php

class Logger {
  private $logDestination;

  function __construct($to = 'console') {
    $logDestination = $to;
  }

  function log($message) {
    switch ($this->logDestination) {
      case 'console':
        switch (gettype($message)) {
          case "string":
            echo '<script>console.log("' . $message . '")</script>';
            break;
          case "array":
            echo '<script>console.log("' . implode(',', $message)  . '")</script>';
            break;
          default:
            echo '<script>console.log("console log aborted due to unknown type of \$message")</script>';
        }
      break;
    }
  }
}

