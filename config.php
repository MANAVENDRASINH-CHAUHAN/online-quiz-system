<?php

$host = "localhost";
$user = "root";
$password = "root";     // MAMP default password
$database = "online_quiz";   // your database name

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>