<?php

/* ---------------- CORS ---------------- */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include "db.php";

/* ---------------- API KEY ---------------- */

$apiKey = "AIzaSyAULJeGRddVJ8v6_01XU2MjNUnufv-CPTo";

/* ---------------- INPUT ---------------- */

$input = json_decode(file_get_contents("php://input"), true);

$title = $input["title"] ?? "";
$duration = intval($input["duration"] ?? 60);
$topic = $input["topic"] ?? "";
$count = intval($input["count"] ?? 5);
$difficulty = $input["difficulty"] ?? "Easy";

if(!$topic){
    echo json_encode([
        "status"=>"error",
        "message"=>"Topic missing"
    ]);
    exit;
}

/* ---------------- SAVE QUIZ ---------------- */

$title = $conn->real_escape_string($title);

$sql = "INSERT INTO quizzes (title,duration,total_questions)
        VALUES ('$title',$duration,0)";

$result = $conn->query($sql);

if(!$result){
    echo json_encode([
        "status"=>"error",
        "message"=>$conn->error
    ]);
    exit;
}

$quiz_id = $conn->insert_id;

/* ---------------- PROMPT ---------------- */

$prompt = "Generate $count multiple choice questions about $topic.
Difficulty: $difficulty.

Return ONLY valid JSON in this format:

{
  \"questions\": [
    {
      \"question\": \"Question text\",
      \"option_a\": \"Option A\",
      \"option_b\": \"Option B\",
      \"option_c\": \"Option C\",
      \"option_d\": \"Option D\",
      \"correct_option\": \"A\"
    }
  ]
}";

/* ---------------- GEMINI API ---------------- */

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" . $apiKey;

$body = [
    "contents"=>[
        [
            "parts"=>[
                ["text"=>$prompt]
            ]
        ]
    ]
];

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);

$response = curl_exec($ch);

if(curl_errno($ch)){
    echo json_encode([
        "status"=>"error",
        "message"=>curl_error($ch)
    ]);
    exit;
}

curl_close($ch);

$result = json_decode($response,true);

/* ---------------- CHECK RESPONSE ---------------- */

if(!isset($result["candidates"][0]["content"]["parts"][0]["text"])){

    echo json_encode([
        "status"=>"error",
        "message"=>"Invalid Gemini response",
        "raw"=>$result
    ]);
    exit;
}

/* ---------------- CLEAN AI TEXT ---------------- */

$aiText = $result["candidates"][0]["content"]["parts"][0]["text"];

$aiText = str_replace(["```json","```"],"", $aiText);
$aiText = trim($aiText);

$data = json_decode($aiText,true);

if(!$data){
    echo json_encode([
        "status"=>"error",
        "message"=>"AI returned invalid JSON",
        "raw"=>$aiText
    ]);
    exit;
}

/* ---------------- SAVE QUESTIONS ---------------- */

$questions = $data["questions"];

foreach($questions as $q){

    $question = $conn->real_escape_string($q["question"]);
    $a = $conn->real_escape_string($q["option_a"]);
    $b = $conn->real_escape_string($q["option_b"]);
    $c = $conn->real_escape_string($q["option_c"]);
    $d = $conn->real_escape_string($q["option_d"]);
    $correct = $conn->real_escape_string($q["correct_option"]);

    $conn->query("
        INSERT INTO questions
        (quiz_id,question,option_a,option_b,option_c,option_d,correct_answer)
        VALUES
        ($quiz_id,'$question','$a','$b','$c','$d','$correct')
    ");
}

/* ---------------- UPDATE QUESTION COUNT ---------------- */

$total = $conn->query("
SELECT COUNT(*) as total 
FROM questions 
WHERE quiz_id=$quiz_id
")->fetch_assoc()["total"];

$conn->query("
UPDATE quizzes 
SET total_questions=$total 
WHERE id=$quiz_id
");

/* ---------------- SUCCESS RESPONSE ---------------- */

echo json_encode([
    "status"=>"success",
    "quiz_id"=>$quiz_id,
    "total_questions"=>$total
]);

?>