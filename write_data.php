<?php

$db = parse_url(getenv("DATABASE_URL"));
$db["path"] = ltrim($db["path"], "/");


try {
    $conn = pg_connect(getenv("DATABASE_URL"));
}