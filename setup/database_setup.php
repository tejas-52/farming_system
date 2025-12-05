<?php
// setup/database_setup.php

// Database credentials
$host = 'localhost';
$user = 'root'; // Change if different
$pass = ''; // Change if different
$dbname = 'smart_farm';

echo "Smart Farming System - Database Setup\n";
echo "=====================================\n\n";

try {
    // Create connection without database
    $conn = new mysqli($host, $user, $pass);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    echo "✓ Connected to MySQL server\n";
    
    // Create database if not exists
    $sql = "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    if ($conn->query($sql) === TRUE) {
        echo "✓ Database '$dbname' created or already exists\n";
    } else {
        echo "✗ Error creating database: " . $conn->error . "\n";
    }
    
    // Select the database
    $conn->select_db($dbname);
    
    // Users Table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('farmer', 'buyer', 'admin') DEFAULT 'farmer',
        avatar_url VARCHAR(255),
        location VARCHAR(100),
        farm_size DECIMAL(10, 2),
        experience_years INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table 'users' created\n";
    } else {
        echo "✗ Error creating users table: " . $conn->error . "\n";
    }
    
    // Marketplace Products Table
    $sql = "CREATE TABLE IF NOT EXISTS marketplace_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        crop_type VARCHAR(50),
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        location VARCHAR(100),
        status ENUM('active', 'sold', 'expired') DEFAULT 'active',
        images TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table 'marketplace_products' created\n";
    } else {
        echo "✗ Error creating marketplace_products table: " . $conn->error . "\n";
    }
    
    // Forum Posts Table
    $sql = "CREATE TABLE IF NOT EXISTS forum_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        tags TEXT,
        views INT DEFAULT 0,
        replies_count INT DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table 'forum_posts' created\n";
    } else {
        echo "✗ Error creating forum_posts table: " . $conn->error . "\n";
    }
    
    // Chat History Table
    $sql = "CREATE TABLE IF NOT EXISTS chat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id VARCHAR(50),
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        category VARCHAR(50),
        sentiment ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table 'chat_history' created\n";
    } else {
        echo "✗ Error creating chat_history table: " . $conn->error . "\n";
    }
    
    // Crops Table
    $sql = "CREATE TABLE IF NOT EXISTS crops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        scientific_name VARCHAR(100),
        description TEXT,
        season ENUM('Rabi', 'Kharif', 'Zaid'),
        duration_days INT,
        water_requirements TEXT,
        soil_type TEXT,
        temperature_range TEXT,
        harvest_time TEXT,
        image_url VARCHAR(255)
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table 'crops' created\n";
    } else {
        echo "✗ Error creating crops table: " . $conn->error . "\n";
    }
    
    // Diseases Table
    $sql = "CREATE TABLE IF NOT EXISTS diseases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        crop_id INT,
        name VARCHAR(100) NOT NULL,
        symptoms TEXT,
        prevention TEXT,
        treatment TEXT,
        image_url VARCHAR(255),
        FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table 'diseases' created\n";
    } else {
        echo "✗ Error creating diseases table: " . $conn->error . "\n";
    }
    
    // Pesticides Table
    $sql = "CREATE TABLE IF NOT EXISTS pesticides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        target_diseases TEXT,
        dosage TEXT,
        precautions TEXT,
        waiting_period_days INT,
        price_range VARCHAR(50)
    ) ENGINE=InnoDB";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Table 'pesticides' created\n";
    } else {
        echo "✗ Error creating pesticides table: " . $conn->error . "\n";
    }
    
    // Insert sample data for crops
    $sql = "INSERT IGNORE INTO crops (name, scientific_name, description, season, duration_days, soil_type) VALUES
        ('Wheat', 'Triticum aestivum', 'A staple food grain grown worldwide', 'Rabi', 120, 'Well-drained loamy soil'),
        ('Rice', 'Oryza sativa', 'Main food crop in many countries', 'Kharif', 150, 'Clayey loam with good water retention'),
        ('Maize', 'Zea mays', 'Versatile crop used for food and feed', 'Kharif', 90, 'Well-drained sandy loam'),
        ('Sugarcane', 'Saccharum officinarum', 'Commercial crop for sugar production', 'Zaid', 300, 'Deep rich loamy soil'),
        ('Cotton', 'Gossypium hirsutum', 'Fiber crop for textile industry', 'Kharif', 180, 'Black cotton soil')";
    
    if ($conn->query($sql) === TRUE) {
        echo "✓ Sample crops data inserted\n";
    }
    
    // Create indexes
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_products_farmer ON marketplace_products(farmer_id)",
        "CREATE INDEX IF NOT EXISTS idx_posts_user ON forum_posts(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id)"
    ];
    
    foreach ($indexes as $indexSql) {
        $conn->query($indexSql);
    }
    
    echo "\n✓ Database setup completed successfully!\n";
    
    // Test connection with new config
    echo "\nTesting connection with config/database.php...\n";
    
    // Create config file with your credentials
    $config_content = '<?php
define("DB_HOST", "' . $host . '");
define("DB_NAME", "' . $dbname . '");
define("DB_USER", "' . $user . '");
define("DB_PASS", "' . $pass . '");
?>';
    
    file_put_contents('config/credentials.php', $config_content);
    echo "✓ Configuration file created at config/credentials.php\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

$conn->close();
?>