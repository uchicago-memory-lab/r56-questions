<?php

$db = parse_url(getenv("DATABASE_URL"));

// Heroku handles the connstring part of this. 
// Presumably our credentials are safe so we needn't take any safety measures here?

$data_array = json_decode(file_get_contents("php://input"), true);


try{
    $pdo = new PDO("pgsql:" . sprintf(
        "host=%s;port=%s;user=%s;password=%s;dbname=%s",
        $db["host"],
        $db["port"],
        $db["user"],
        $db["pass"],
        ltrim($db["path"], "/")
    ));
    
    foreach ($data_array as $name => $data){
        foreach ($data as $result){
            $colnames = [];
            $colvals = [];
            foreach ($result as $col => $dpoint){
                $pdo->query("ALTER TABLE subjects ADD COLUMN IF NOT EXISTS $col");
                $colnames[] = $col;
                $colvals[] = $dpoint;
            }
            $pdo->query("INSERT INTO subjects (pid, {implode(\", \",$colnames)}) VALUES ($name, {implode(\", \")})");
        }
    }

} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }

?>