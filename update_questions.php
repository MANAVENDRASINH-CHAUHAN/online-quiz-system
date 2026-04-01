<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$questions = $data["questions"];

foreach($questions as $q){

$id = $q["id"];
$question = $conn->real_escape_string($q["question"]);
$a = $conn->real_escape_string($q["option_a"]);
$b = $conn->real_escape_string($q["option_b"]);
$c = $conn->real_escape_string($q["option_c"]);
$d = $conn->real_escape_string($q["option_d"]);
$correct = $conn->real_escape_string($q["correct_answer"]);

$conn->query("
UPDATE questions
SET
question='$question',
option_a='$a',
option_b='$b',
option_c='$c',
option_d='$d',
correct_answer='$correct'
WHERE id=$id
");

}

echo json_encode(["status"=>"updated"]);