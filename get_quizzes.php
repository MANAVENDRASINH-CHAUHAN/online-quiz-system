<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

$sql = "SELECT id, title, total_questions, duration FROM quizzes ORDER BY id DESC";

$result = $conn->query($sql);

$quizzes = [];

if ($result) {

    while($row = $result->fetch_assoc()){
        $quizzes[] = $row;
    }

}

echo json_encode($quizzes);

$conn->close();

?>