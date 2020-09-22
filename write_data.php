<?php

$db = parse_url(getenv("DATABASE_URL"));

// Heroku handles the connstring part of this. 
// Presumably our credentials are safe so we needn't take any safety measures here?

$data_array = json_decode(file_get_contents("php://input"), true);

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
    
    foreach ($data_array as $name => $data){
        foreach ($data as $result){
            $colnames = [];
            $colvals = [];
            foreach ($result as $col => $dpoint){
                if(substr($col, -1) === 'T'){
                    $ctype = 'integer';
                    $colname = substr($col, 0, -1);
                    $pdo->query("ALTER TABLE reaction_time ADD COLUMN IF NOT EXISTS $colname $ctype");
                    $pdo->query("INSERT INTO reaction_time (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                } else if(substr($col, -1) === 'R'){
                    $ctype = 'text';
                    $colname = substr($col, 0, -1);
                    $pdo->query("ALTER TABLE response ADD COLUMN IF NOT EXISTS $colname $ctype");
                    $pdo->query("INSERT INTO response (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                } else if(substr($col, -1) === 'A'){
                    $ctype = 'text';
                    $colname = substr($col, 0, -1);
                    $pdo->query("INSERT INTO answers (task, answer) VALUES ('$colname', '$dpoint') ON CONFLICT (task) DO UPDATE SET answer = '$dpoint'");
                } else if(substr($col, -1) === 'O'){
                    $ctype = 'smallint';
                    $colname = substr($col, 0, -1);
                    $pdo->query("INSERT INTO ordering (pid, ordering) VALUES ('$colname', '$dpoint') ON CONFLICT (pid) DO UPDATE SET ordering = '$dpoint'");

                }

            }
        }
    }

} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }

?>