<?php
header("Content-Type: audio/mpeg");
$post = json_decode(file_get_contents("php://input"), true);
$text = $post["text"] ?? "टेस्ट";
$voice = $post["voiceId"] ?? "Namrita";

define("MURF_KEY", getenv("MURF_API_KEY"));  // तुम्हारी Murf key

$payload = ["voiceId"=>$voice, "text"=>$text, "model"=>"Falcon", "style"=>"Conversational", "format"=>"MP3", "sampleRate"=>24000];
$ch = curl_init("https://global.api.murf.ai/v1/speech/stream");
curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_POSTFIELDS=>json_encode($payload), CURLOPT_HTTPHEADER=>["Content-Type: application/json", "api-key: ".MURF_KEY], CURLOPT_RETURNTRANSFER=>true]);
echo curl_exec($ch);
?>