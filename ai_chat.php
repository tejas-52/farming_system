


<?php
$apiKey = "AIzaSyDOxJoPZPYdtwkbOpp4t_bYHFLuP1NdKiY";
$userMsg = $_POST["msg"];

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

$data = [
  "contents" => [
    ["parts" => [["text" => $userMsg]]]
  ],
  "generationConfig" => [
    "temperature" => 0.7,
    "maxOutputTokens" => 600z
  ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

echo $result["candidates"][0]["content"]["parts"][0]["text"];
?>
