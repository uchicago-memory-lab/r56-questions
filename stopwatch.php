<?php

$db = parse_url(getenv("DATABASE_URL"));

$data_array = json_decode(file_get_contents("php://input")

function console_log($output, $with_script_tags = true) {
    $js_code = 'console.log(' . json_encode($output, JSON_HEX_TAG) . 
');';
    if ($with_script_tags) {
        $js_code = '<script>' . $js_code . '</script>';
    }
    echo $js_code;
}

try{
    $pdo = new PDO("pgsql:" . sprintf(
        "host=%s;port=%s;user=%s;password=%s;dbname=%s",
        $db["host"],
        $db["port"],
        $db["user"],
        $db["pass"],
        ltrim($db["path"], "/")
    ));

    $time = $data_array['time'];
    $pid = $data_array['pid'];

    $pdo->query("INSERT INTO time_elapsed (pid, time_elapsed) VALUES ('$pid', $time)")
    console_log("INSERT INTO time_elapsed (pid, time_elapsed) VALUES ('$pid', $time)")
} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }