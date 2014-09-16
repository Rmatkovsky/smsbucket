<?php
ini_set('display_errors',1);
$config = array(
    'url' => 'https://api.pay4it.dk:8090/',
    'format' => 'json',
    'username' => 'ji@cphpress.com',
    'password' => 'e8d34dcd-fb24-4ae5-9591-31a0abe38eb9',
    'pay4itsecurity' => 'e18bb807-5b12-40f3-ad22-0d3a2af8be0e',
    'sendsms' => '/SendSMS?Message=%s&Recipient=%s',
    'getservertime' => '/GetServerTime'
    );

if(isset($_POST['sendSMS']) && isset($_POST['message']) && isset($_POST['recipient'])) {
    sendData($_POST['message'], $_POST['recipient']);
}
// if(isset($_GET['sendSMS']) && isset($_GET['message']) && isset($_GET['recipient'])) {
//     sendData($_GET['message'], $_GET['recipient']);
// }


function sendData ($message, $recipient) {
    global $config;

    $url = $config['url'].$config['format'].sprintf($config['sendsms'],urlencode($message),
        $recipient);
    //$url = $config['url'].$config['format'].$config['getservertime'];
    //open connection
    header('Content-Type: application/json');
    $ch = curl_init();
    //set the url, and add the headers
    curl_setopt($ch, CURLOPT_URL, $url);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    //curl_setopt($ch, CURLOPT_VERBOSE, true);
//    curl_setopt($ch, CURLOPT_STDERR,  fopen('php://output', 'w'));
     curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Password:'.$config['password'],
    'Pay4itSecurity:'.$config['pay4itsecurity'],
    'UserName:'.$config['username']
    ));
    //execute post
    $result = curl_exec($ch);
    //close connection
    curl_close($ch);
}

?>
