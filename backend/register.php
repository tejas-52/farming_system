<?php
require_once 'db_connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $fullName = $data['full_name'] ?? '';
    $phone = $data['phone'] ?? '';
    
    // Validate input
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    // Check if user exists
    $stmt = $db->query("SELECT id FROM users WHERE email = ? OR username = ?", [$email, $username]);
    if ($stmt->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'User already exists']);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $db->query(
        "INSERT INTO users (username, email, password, full_name, phone, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())",
        [$username, $email, $hashedPassword, $fullName, $phone]
    );
    
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Registration successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed']);
    }
}
?>