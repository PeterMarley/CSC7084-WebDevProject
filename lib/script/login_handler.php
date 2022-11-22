<?php 
// process login
$fields = ['username' => $_POST['username'], 'password' => $_POST['password']];
$fields_string = http_build_query($fields);

$ch = curl_init(LOGIN_URL);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // resolve this?

$result = json_decode(curl_exec($ch));
curl_close($ch);

if($result->encryptedPassword != 0) {
  echo 'huzzah! welcome ' . $result->username;
  $_SESSION['username'] = $result->username;
  $_SESSION['encrypted-pw'] = $result->encryptedPassword;
  $_SESSION['login-time'] = time();
}