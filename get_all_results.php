<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

$sql = "SELECT r.id, r.student, q.title, r.score, r.submitted_at
        FROM results r
        JOIN quizzes q ON r.quiz_id = q.id
        ORDER BY r.id DESC";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);

$conn->close();

?>