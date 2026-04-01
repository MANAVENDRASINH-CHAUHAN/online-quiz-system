<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
    echo json_encode([
        "status"=>"error",
        "message"=>"No data received"
    ]);
    exit();
}

$name = $data["name"] ?? "";
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

if(!$name || !$email || !$password){
    echo json_encode([
        "status"=>"error",
        "message"=>"All fields are required"
    ]);
    exit();
}

/* Check duplicate email */

$check = $conn->prepare("SELECT id FROM students WHERE email=?");
$check->bind_param("s",$email);
$check->execute();
$result = $check->get_result();

if($result->num_rows > 0){

    echo json_encode([
        "status"=>"error",
        "message"=>"Email already registered"
    ]);
    exit();

}

/* Insert student */

$stmt = $conn->prepare("INSERT INTO students (name,email,password) VALUES (?,?,?)");
$stmt->bind_param("sss",$name,$email,$password);

if($stmt->execute()){

    $newStudentId = $stmt->insert_id;

    echo json_encode([
        "status"=>"success",
        "message"=>"Registration Successful",
        "name"=>$name,
        "user_id"=>$newStudentId
    ]);

}else{

    echo json_encode([
        "status"=>"error",
        "message"=>"Registration Failed"
    ]);

}

?>
