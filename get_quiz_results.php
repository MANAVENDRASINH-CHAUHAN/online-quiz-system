<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

if(!isset($_GET["quiz_title"])){
    echo json_encode([]);
    exit;
}

$quiz_title = $conn->real_escape_string($_GET["quiz_title"]);

$sql = "
SELECT student, quiz_title, score, submitted_at
FROM results
WHERE quiz_title = '$quiz_title'
ORDER BY submitted_at DESC
";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);

$conn->close();

?>