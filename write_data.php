<?php

$db = parse_url(getenv("DATABASE_URL"));

// Heroku handles the connstring part of this. 
// Presumably our credentials are safe so we needn't take any safety measures here?

$data_array = json_decode(file_get_contents("php://input"), true);

$temp_username = 'YeetBird123';
// This will be the row name until I get the qualtrics side of things built. 
// I'll delete that line later.

try{
    $pdo = new PDO("pgsql:" . sprintf(
        "host=%s;port=%s;user=%s;password=%s;dbname=%s",
        $db["host"],
        $db["port"],
        $db["user"],
        $db["pass"],
        ltrim($db["path"], "/")
    ));
    

} catch(Exception $e) {
    echo '{"success": false, "message": ' . $e->getMessage() . '}';
  }
