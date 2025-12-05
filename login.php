<?php
// login.php - Simple login for testing
require_once 'config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // For testing, use any email/password
    if (!empty($email)) {
        // Check if user exists
        $query = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['full_name'];
            header('Location: dashboard.php');
            exit();
        } else {
            // Create a test user if doesn't exist
            $insert_query = "INSERT INTO users (full_name, email, phone, role, created_at) 
                            VALUES (?, ?, ?, 'farmer', NOW())";
            $stmt = $conn->prepare($insert_query);
            $name = explode('@', $email)[0];
            $phone = '1234567890';
            $stmt->bind_param("sss", $name, $email, $phone);
            $stmt->execute();
            
            $_SESSION['user_id'] = $stmt->insert_id;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_name'] = $name;
            header('Location: dashboard.php');
            exit();
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Login - Smart Farming</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="login-container">
        <h1>Login to Smart Farm</h1>
        <form method="POST">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <p>For testing, enter any email and password</p>
    </div>
</body>
</html>