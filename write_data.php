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
                if(substr($col, -1) === 'R'){
                    $ctype = 'text';
                } else {
                    $ctype = 'smallint';
                }
                $pdo->query("ALTER TABLE subjects ADD COLUMN IF NOT EXISTS $col $ctype");
                $colnames[] = $col;
                $colvals[] = $dpoint;
            }
            $qnames = implode(", ", $colnames);
            $qvals = implode(", ", $colvals);
            $pdo->query("INSERT INTO subjects (pid, $qnames) VALUES ($name, $qvals)})");
            console_log("INSERT INTO subjects (pid, $qnames) VALUES ($name, $qvals)})");
        }
    }

} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }

?>