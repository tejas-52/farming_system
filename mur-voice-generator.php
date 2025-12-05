<?php
header('Content-Type: audio/mpeg');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No text provided']);
    exit;
}

$text = $data['text'];
$voiceId = $data['voiceId'] ?? 'en-US-matthew';
$speed = $data['speed'] ?? 1.0;

// Your MURF API Key (store this securely in environment variables in production)
$apiKey = 'ap2_44f29c64-ff19-429b-aafe-fcc53eda9d40';

// Prepare MURF API request
$murApiUrl = 'https://api.murf.ai/v1/speech/generate';

$postData = [
    'voice' => $voiceId,
    'text' => $text,
    'format' => 'mp3',
    'sampleRate' => 24000,
    'speed' => $speed
];

$ch = curl_init($murApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'api-key: ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'CURL Error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

if ($httpCode === 200) {
    // Return the audio file directly
    echo $response;
} else {
    http_response_code($httpCode);
    echo json_encode(['error' => 'MURF API Error', 'code' => $httpCode]);
}
?>