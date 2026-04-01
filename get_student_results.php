<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "db.php";

$studentId = isset($_GET["student_id"]) ? intval($_GET["student_id"]) : 0;
$studentName = trim($_GET["student"] ?? "");

$candidateNames = [];

if ($studentId > 0) {
    $studentStmt = $conn->prepare("SELECT name FROM students WHERE id = ?");
    $studentStmt->bind_param("i", $studentId);
    $studentStmt->execute();
    $studentResult = $studentStmt->get_result();

    if ($studentResult && $studentResult->num_rows > 0) {
        $studentRow = $studentResult->fetch_assoc();
        $canonicalName = trim($studentRow["name"] ?? "");

        if ($canonicalName !== "") {
            $candidateNames[] = strtolower($canonicalName);
        }
    }

    $studentStmt->close();
}

if ($studentName !== "") {
    $candidateNames[] = strtolower($studentName);
}

$candidateNames = array_values(array_unique(array_filter($candidateNames)));

if (count($candidateNames) === 0) {
    echo json_encode([]);
    $conn->close();
    exit;
}

$sql = "SELECT r.id, q.title, r.score, r.submitted_at
        FROM results r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE LOWER(TRIM(r.student)) ";

if (count($candidateNames) === 1) {
    $sql .= "= ? ";
} else {
    $sql .= "IN (?, ?) ";
}

$sql .= "ORDER BY r.submitted_at DESC, r.id DESC";

$stmt = $conn->prepare($sql);

if (count($candidateNames) === 1) {
    $stmt->bind_param("s", $candidateNames[0]);
} else {
    $stmt->bind_param("ss", $candidateNames[0], $candidateNames[1]);
}
$stmt->execute();

$result = $stmt->get_result();
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);

$stmt->close();
$conn->close();

?>
