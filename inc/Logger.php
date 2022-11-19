<?php
include_once('ILogger.php');
/**
 * Logger
 * 
 * This object may be used to log information to various places
 */
class Logger implements ILogger {
  
  private $logFunc;
  private $allowedLoggingTypes = ['console'];
  
  /**
   * __construct
   *
   * @param  mixed $to logging destination. Valid values are contained in $allowedLoggingTypes;
   * @return Logger
   */
  public function __construct($to = 'console') {
    // validate $to
    if (array_search($to, $this->allowedLoggingTypes) === false) {
      throw new InvalidArgumentException("\"{$to}\" not a recognised logging type, valid types:" . implode(', ', $this->allowedLoggingTypes));
    }
    
    $this->logFunc = $to;   
  }

  public static function getInstance() {
    
  }
    
  /**
   * log method is the publically accessible logging method available from an instance of Logger. It logs dynamically to the intended location
   * depending on the $to parameter passed during construction
   *
   * @param  mixed $message the message to be logged
   * @return void
   */
  public function log($message) {
    $this->{$this->logFunc}($message);
  }

  /**
   * console private method is used to echo a javascript command to log information to the console
   *
   * @param  string|array $message the message to log to browser console
   * @throws InvalidArgumentException if an invalid kind of $message argument is passed
   * @return void
   */
  private function console($message) {
    switch (gettype($message)) {
      case "string":
        echo'<script>console.log("' . $message . '")</script>';
        break;
      case "array":
        echo '<script>console.log("' . implode(',', $message)  . '")</script>';
        break;
      case "boolean":
        echo '<script>console.log("' . $message ? "true" : false  . '")</script>';
        break;
      default:
        throw new InvalidArgumentException("console log aborted due to unknown type of \$message: ". getType($message));
    }
  }

}

