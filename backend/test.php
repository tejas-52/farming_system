<?php
echo "PHP is working!<br>";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
echo "PHP Version: " . phpversion() . "<br>";
echo "cURL: " . (function_exists('curl_init') ? 'Enabled' : 'Disabled') . "<br>";
echo "JSON: " . (function_exists('json_decode') ? 'Enabled' : 'Disabled') . "<br>";

// Test config files
$configFiles = [
    'murf_api_key.php',
    'gemini_api_key.php'
];

foreach ($configFiles as $file) {
    $path = "config/$file";
    if (file_exists($path)) {
        echo "$file: ✅ Exists<br>";
    } else {
        echo "$file: ❌ Missing<br>";
    }
}
?>