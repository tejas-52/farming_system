<?php
// backend/kisan_tts.php
header("Content-Type: audio/mpeg");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Cache-Control: no-cache");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load Murf API key
require_once "config/murf_api_key.php";

if (!defined('MURF_API_KEY') || empty(MURF_API_KEY)) {
    http_response_code(500);
    exit("TTS configuration error");
}

$input = json_decode(file_get_contents("php://input"), true);
$text = trim($input['text'] ?? '');
$voiceId = $input['voiceId'] ?? 'Namrita';  // Namrita (Hindi), Nikhil (English), Alicia (Marathi), Arjun (Punjabi)

if (empty($text)) {
    http_response_code(400);
    exit("No text provided");
}

if (strlen($text) > 3000) {
    $text = substr($text, 0, 3000) . "...";
}

$payload = [
    "voiceId" => $voiceId,
    "text" => $text,
    "model" => "Falcon",
    "style" => "Conversational",
    "format" => "MP3",
    "sampleRate" => 24000
];

$ch = curl_init("https://global.api.murf.ai/v1/speech/stream");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "api-key: " . MURF_API_KEY
    ],
    CURLOPT_TIMEOUT => 60
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $response) {
    header("Content-Length: " . strlen($response));
    echo $response;
} else {
    http_response_code(500);
    echo "TTS generation failed";
}
exit();
?>