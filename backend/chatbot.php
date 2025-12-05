<?php
require_once 'db_connection.php';
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $userQuery = $data['query'] ?? '';
    $botResponse = $data['response'] ?? '';
    $userId = $_SESSION['user_id'] ?? null;
    
    if (!empty($userQuery)) {
        // Determine query type
        $queryType = 'general';
        $lowerQuery = strtolower($userQuery);
        
        if (strpos($lowerQuery, 'weather') !== false) $queryType = 'weather';
        elseif (strpos($lowerQuery, 'crop') !== false) $queryType = 'crop';
        elseif (strpos($lowerQuery, 'pest') !== false) $queryType = 'pest';
        elseif (strpos($lowerQuery, 'soil') !== false) $queryType = 'soil';
        elseif (strpos($lowerQuery, 'market') !== false) $queryType = 'market';
        
        // Save to database
        $stmt = $db->query(
            "INSERT INTO chatbot_queries (user_id, user_query, bot_response, query_type, created_at) 
             VALUES (?, ?, ?, ?, NOW())",
            [$userId, $userQuery, $botResponse, $queryType]
        );
        
        // Analytics for farming trends
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Query saved']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save query']);
        }
    }
}

// Get chat history
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
    $stmt = $db->query(
        "SELECT * FROM chatbot_queries 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50",
        [$userId]
    );
    
    $chats = [];
    while ($row = $stmt->fetch_assoc()) {
        $chats[] = $row;
    }
    
    echo json_encode(['success' => true, 'chats' => $chats]);
}
?>