<!DOCTYPE html>
<?php
    $loggedIn = false;

    function checkLogin() {
        global $loggedIn;
        return $loggedIn;
    }
    

    // $arrContextOptions=array(
    //     "ssl"=>array(
    //         "verify_peer"=>false,
    //         "verify_peer_name"=>false,
    //         ),
    //     'http'=>array(
    //         'method'=>"GET",
    //         'header'=>"Accept-language: en\r\n".
    //         "Cookie: PHPSESSID=".session_id()."\r\n"
    //         )
    //     ); 
    // echo session_id();
    // $context = stream_context_create($arrContextOptions);
    // $file = file_get_contents('https://localhost/uni/project/auth/reauth', false, $context);
    // var_dump('file: '.$file);


    //     $curl_handle = curl_init();
    //     curl_setopt($curl_handle, CURLOPT_URL, 'https://localhost/uni/project/auth/reauth');
    //     curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);
    //     curl_setopt($curl_handle, CURLOPT_POST, true);
    //     curl_setopt($curl_handle, CURLOPT_SSL_VERIFYPEER, false); // get an SSL cert for curl!
    //     if ($data) {
    //         curl_setopt($curl_handle, CURLOPT_POSTFIELDS, json_encode($data));
    //     }
    //     echo curl_getinfo($curl_handle, CURLOPT_POSTFIELDS);
    //     $r = json_decode(curl_exec($curl_handle));
    //     //echo curl_errno($curl_handle);
    //     curl_close($curl_handle);




    // var_dump($r);

    
    
    function get_fcontent( $url, $timeout = 5 ) {
   
        $ch = curl_init();
        curl_setopt( $ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1" );
        curl_setopt( $ch, CURLOPT_URL, $url );
        //curl_setopt( $ch, CURLOPT_HTTPHEADER, ['Cookie: PHPSESSID='.session_id()] );
        // curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
        // curl_setopt( $ch, CURLOPT_ENCODING, "" );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
        // curl_setopt( $ch, CURLOPT_AUTOREFERER, true );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false );    # required for https urls
        curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, $timeout );
        curl_setopt( $ch, CURLOPT_TIMEOUT, $timeout );
        //curl_setopt( $ch, CURLOPT_POSTFIELDS, ["session-id"=>session_id()]);
        // curl_setopt( $ch, CURLOPT_MAXREDIRS, 10 );
        $content = curl_exec( $ch );
        
        curl_close ( $ch );       
        return $content;
    }

  









    // echo '<hr>';
    // var_dump('PHPSESSID='.session_id());
    // echo '<hr>';
    // var_dump('PHPSESSID=abmre1av1lca5kmeik3275ae9p');
    // echo '<hr>';
    // var_dump($_SESSION);
    
?>
    <?php include 'template-header.php' ?>
    <div id="body">
        <div><?php include 'template-nav.php'; ?></div>
        <div>
        <?php 
        // echo '<pre>';
        // echo '<hr>';
        // var_dump($_SESSION);
        // var_dump($_REQUEST);
        // var_dump($data['username']);
        // var_dump($data['password']);
        // var_dump($data['login']);
        // var_dump($_SESSION);
        // var_dump($_POST);
        // var_dump($_SERVER);
        // var_dump($_COOKIE);
        // var_dump($_ENV);
        // echo '/<pre>';
        echo '<pre>';
        var_dump( get_fcontent('https://localhost/uni/project/auth/reauth') );
        echo '</pre>';
        if (isset($data) && isset($data['content'])) {
            switch ($data['content']) {
                case 'register':
                    include 'forms/register_form.php';
                    break;
                default:
                    echo 'Unknown content!';
            }
        } else {
            include 'forms/login_form.php';
        }
        ?>
        </div>
    </div>
    <?php include 'template-footer.php' ?>
    