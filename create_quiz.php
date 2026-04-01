<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

/* Handle preflight request */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "db.php";

/* Read JSON input */
$data = json_decode(file_get_contents("php://input"), true);

/* Validate input */
if (!$data || !isset($data["title"]) || !isset($data["duration"])) {

    echo json_encode([
        "status" => "error",
        "message" => "Invalid input data"
    ]);
    exit();

}

$title = $conn->real_escape_string($data["title"]);
$duration = intval($data["duration"]);

/* Insert quiz */
$sql = "INSERT INTO quizzes (title, duration) VALUES ('$title','$duration')";

$result = $conn->query($sql);

if($result){

    $quiz_id = $conn->insert_id;

    echo json_encode([
        "status" => "success",
        "quiz_id" => $quiz_id
    ]);

}else{

    echo json_encode([
        "status" => "error",
        "message" => $conn->error
    ]);

}

$conn->close();

?>