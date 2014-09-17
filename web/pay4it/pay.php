<?php
ini_set('display_errors',0);

$config = array(
    'url' => 'https://api.pay4it.dk:8090/',
    'format' => 'json',
    'username' => 'ji@cphpress.com',
    'password' => 'e8d34dcd-fb24-4ae5-9591-31a0abe38eb9',
    'pay4itsecurity' => 'e18bb807-5b12-40f3-ad22-0d3a2af8be0e',
    'sendsms' => '/SendSMS?Message=%s&Recipient=%s',
    'getservertime' => '/GetServerTime'
    );

$config_parse = array(
    'url' => array(
        'classes' => 'https://api.parse.com/1/classes/',
        'functions' => 'https://api.parse.com/1/functions/'
    ),
    'format' => 'json',
    'appID' => 'q5uk1NhQDpJYQqHCpTBqr0lRcR0x3gu411GwQ3Pj',
    'RESTkey' => 'kKmXZ3ruTZq6bLBlc573ADPFomgfZs8EG3dRcRS2'
);

if(isset($_POST['sendSMS']) && isset($_POST['message']) && isset($_POST['recipient'])) {
    sendData($_POST['message'], $_POST['recipient']);
}
if(isset($_POST['sendParse'])) {
    sendParse($_POST);
}
// if(isset($_GET['sendSMS']) && isset($_GET['message']) && isset($_GET['recipient'])) {
//     sendData($_GET['message'], $_GET['recipient']);
// }


function sendData ( $message, $recipient ) {
    global $config;

    $url = $config['url'].$config['format'].sprintf($config['sendsms'],urlencode($message),
        $recipient);
    //$url = $config['url'].$config['format'].$config['getservertime'];
    //open connection
    header('Content-Type: application/json');
    $ch = curl_init();
    //set the url, and add the headers
    curl_setopt($ch, CURLOPT_URL, $url);
    //curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    //curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    //curl_setopt($ch, CURLOPT_VERBOSE, true);
    //curl_setopt($ch, CURLOPT_STDERR,  fopen('php://output', 'w'));
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

function sendParse ( $params ) {
    global $config_parse;

    $url = $config_parse['url'][$params['method']] . $params['point'];
    header('Content-Type: application/json');
    $ch = curl_init();
    //set the url, and add the headers
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'X-Parse-Application-Id:'.$config_parse['appID'],
        'X-Parse-REST-API-Key:'.$config_parse['RESTkey'],
        'Content-Type: application/json'
    ));
    //execute post
    $result = curl_exec($ch);

    //close connection
    curl_close($ch);
}

?>
