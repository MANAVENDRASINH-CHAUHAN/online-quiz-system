<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$faculty_id = $data["faculty_id"] ?? "";
$password = $data["password"] ?? "";

if(!$faculty_id || !$password){
    echo json_encode([
        "status"=>"error",
        "message"=>"Faculty ID and Password required"
    ]);
    exit();
}

$stmt = $conn->prepare("SELECT * FROM faculty WHERE faculty_id=? AND password=?");
$stmt->bind_param("ss",$faculty_id,$password);
$stmt->execute();

$result = $stmt->get_result();

if($result->num_rows > 0){

    $row = $result->fetch_assoc();

    echo json_encode([
        "status"=>"success",
        "faculty_id"=>$row["faculty_id"],
        "name"=>$row["name"] ?? $row["faculty_id"]
    ]);

}else{

    echo json_encode([
        "status"=>"error",
        "message"=>"Invalid Faculty ID or Password"
    ]);

}

?>
