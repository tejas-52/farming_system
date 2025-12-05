<?php
// backend/kisan_process.php → KISAN SATHI SPECIAL VERSION (100% WORKING)

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Rate limiting
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$key = "rl_$ip";
if (!isset($_SESSION[$key]) || time() - ($_SESSION[$key]['t'] ?? 0) > 60) {
    $_SESSION[$key] = ['c' => 1, 't' => time()];
} else {
    $_SESSION[$key]['c']++;
    if ($_SESSION[$key]['c'] > 25) {
        echo json_encode(["reply" => "बहुत ज्यादा अनुरोध। 1 मिनट रुकें।"]);
        exit();
    }
}

// Input
$input = json_decode(file_get_contents("php://input"), true) ?: [];
$message = trim($input["message"] ?? "");
$lang_mode = $input["lang_mode"] ?? "hindi";
$history = $input["history"] ?? [];

if (empty($message)) {
    echo json_encode(["reply" => "कृपया अपना सवाल पूछें"]);
    exit();
}

// आपकी API Key (आपने पहले दी थी)
define("GEMINI_API_KEY", "AIzaSyDOxJoPZPYdtwkbOpp4t_bYHFLuP1NdKiY");

// History
$historyText = "";
foreach ($history as $h) {
    if (isset($h["role"], $h["content"])) {
        $role = $h["role"] === "user" ? "किसान" : "किसान साथी";
        $historyText .= "$role: " . strip_tags($h["content"]) . "\n";
    }
}

// Language instruction
$langInstruction = match($lang_mode) {
    "english" => "Reply only in simple Indian English.",
    "marathi" => "उत्तर फक्त मराठीत द्या. सोप्या शब्दात.",
    default   => "उत्तर केवल सरल हिंदी या हिंग्लिश में दें। किसान आसानी से समझ सके।"
};

// PROMPT – अब यह 100% किसान साथी है
$prompt = <<<PROMPT
आप "किसान साथी" हैं – भारत का सबसे भरोसेमंद AI फार्मिंग असिस्टेंट।
आज की तारीख: {{date}}

आपका काम:
• फसल, मौसम, खाद, बीज, कीट, सरकारी योजनाएँ, मंडी भाव, मिट्टी, पानी बचत आदि पर सही और तुरंत काम आने वाली सलाह देना
• हमेशा भारतीय किसान की भाषा और स्थिति को ध्यान में रखें
• जवाब बहुत छोटा (2-4 वाक्य), स्पष्ट और प्रैक्टिकल हो
• जरूरी हो तो बुलेट पॉइंट्स दें
• गलत या अवैध सलाह कभी न दें
• बहुत जटिल सवाल हो तो कहें: "इसके लिए नजदीकी कृषि अधिकारी से संपर्क करें"

भाषा: {$langInstruction}

पिछली बातचीत:
{$historyText}

किसान का सवाल: {$message}

आपका जवाब:
PROMPT;

$prompt = str_replace("{{date}}", date("d-m-Y"), $prompt);

// Gemini 2.5 Flash – सबसे नया और तेज़
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . GEMINI_API_KEY;

$payload = json_encode([
    "contents" => [[ "parts" => [[ "text" => $prompt ]] ]],
    "generationConfig" => [
        "temperature" => 0.7,
        "maxOutputTokens" => 500
    ]
]);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => false   // कभी-कभी SSL issue को bypass करता है
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// अगर कोई दिक्कत हो तो हिंदी में बताओ
if ($httpCode !== 200 || !$response) {
    $msg = ($httpCode == 400 || $httpCode == 403)
        ? "Gemini API में समस्या। कृपया 1 मिनट बाद फिर कोशिश करें।"
        : "सर्वर में थोड़ी दिक्कत है। फिर कोशिश करें।";
    echo json_encode(["reply" => $msg]);
    exit();
}

$data = json_decode($response, true);
$reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? "फिर से पूछें";

$reply = trim($reply);
$reply = preg_replace('/^["\']|["\']$/u', '', $reply);

echo json_encode([
    "reply" => $reply,
    "status" => "success"
]);
exit();
?>