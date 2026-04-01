<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "db.php";

/* Check quiz_id */

if(!isset($_GET["quiz_id"])){

    echo json_encode([
        "status"=>"error",
        "message"=>"quiz_id missing"
    ]);
    exit;

}

$quiz_id = intval($_GET["quiz_id"]);

/* Get questions */

$sql = "SELECT id, question, option_a, option_b, option_c, option_d, correct_answer
        FROM questions
        WHERE quiz_id = $quiz_id";

$result = $conn->query($sql);

if(!$result){

    echo json_encode([
        "status"=>"error",
        "message"=>$conn->error
    ]);
    exit;

}

$questions = [];

while($row = $result->fetch_assoc()){
    $questions[] = $row;
}

echo json_encode($questions);

$conn->close();

?>