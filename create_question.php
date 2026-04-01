<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$quiz_id = $data["quiz_id"];
$questions = $data["questions"];

foreach($questions as $q){

    $question = $q["question"];
    $a = $q["a"];
    $b = $q["b"];
    $c = $q["c"];
    $d = $q["d"];
    $correct = $q["correct"];

    $sql = "INSERT INTO questions 
    (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES 
    ('$quiz_id','$question','$a','$b','$c','$d','$correct')";

    mysqli_query($conn,$sql);
}

# COUNT QUESTIONS FOR THIS QUIZ
$countQuery = "SELECT COUNT(*) as total FROM questions WHERE quiz_id='$quiz_id'";
$result = mysqli_query($conn,$countQuery);
$row = mysqli_fetch_assoc($result);

$total_questions = $row["total"];

# UPDATE QUIZ TABLE
$update = "UPDATE quizzes SET total_questions='$total_questions' WHERE id='$quiz_id'";
mysqli_query($conn,$update);

echo json_encode([
    "status"=>"success"
]);

?>