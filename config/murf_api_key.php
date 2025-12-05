<?php
// backend/config/murf_api_key.php

// Get your FREE Murf.ai API key from: https://murf.ai/api
// (Free plan gives 10 minutes/month — enough for testing & small sites)

define("MURF_API_KEY", "ap2_44f29c64-ff19-429b-aafe-fcc53eda9d40"); 

// Security: Prevent direct access
if (basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    header("HTTP/1.0 403 Forbidden");
    exit("Direct access denied");
}
?>