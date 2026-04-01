<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$studentId = isset($data["student_id"]) ? intval($data["student_id"]) : 0;
$student = trim($data["student"] ?? "");
$quiz_id = isset($data["quiz_id"]) ? intval($data["quiz_id"]) : 0;
$score = isset($data["score"]) ? intval($data["score"]) : null;

if ((!$studentId && $student === "") || !$quiz_id || $score === null) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required data"
    ]);
    exit;
}

if ($studentId > 0) {
    $studentStmt = $conn->prepare("SELECT name FROM students WHERE id = ?");
    $studentStmt->bind_param("i", $studentId);
    $studentStmt->execute();
    $studentResult = $studentStmt->get_result();

    if ($studentResult && $studentResult->num_rows > 0) {
        $studentRow = $studentResult->fetch_assoc();
        $student = trim($studentRow["name"] ?? $student);
    }

    $studentStmt->close();
}

if ($student === "") {
    echo json_encode([
        "status" => "error",
        "message" => "Student not found"
    ]);
    exit;
}

$quizStmt = $conn->prepare("SELECT title FROM quizzes WHERE id = ?");
$quizStmt->bind_param("i", $quiz_id);
$quizStmt->execute();
$quizResult = $quizStmt->get_result();

if (!$quizResult || $quizResult->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Quiz not found"
    ]);
    $quizStmt->close();
    exit;
}

$quizRow = $quizResult->fetch_assoc();
$quiz_title = $quizRow["title"];
$quizStmt->close();

$insertStmt = $conn->prepare("
    INSERT INTO results (student, quiz_id, quiz_title, score, submitted_at)
    VALUES (?, ?, ?, ?, NOW())
");
$insertStmt->bind_param("sisi", $student, $quiz_id, $quiz_title, $score);

if ($insertStmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Result saved"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $insertStmt->error
    ]);
}

$insertStmt->close();
$conn->close();

?>
