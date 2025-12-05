<?php
// config/database.php - Fixed for XAMPP
@session_start();

// Enable error reporting for development
error_reporting(E_ERROR | E_WARNING | E_PARSE);
ini_set('display_errors', 1);

// Database configuration for XAMPP
$host = 'localhost';
$username = 'root';
$password = ''; // Empty password for XAMPP
$database = 'smart_farming';

// Create connection
$conn = @new mysqli($host, $username, $password);
// Check connection
if ($conn->connect_error) {
    // If connection fails, use session storage instead
    $_SESSION['use_local_storage'] = true;
    
    // Create mock connection object to prevent errors
    $conn = new class() {
        public $connect_error = null;
        public function prepare($sql) { 
            return new class() {
                public function bind_param() { return true; }
                public function execute() { return true; }
                public function get_result() { 
                    return new class() {
                        public $num_rows = 0;
                        public function fetch_assoc() { return []; }
                        public function data_seek() { return true; }
                    };
                }
            };
        }
        public function query($sql) { 
            return new class() {
                public $num_rows = 0;
                public function fetch_assoc() { return []; }
                public function data_seek() { return true; }
            };
        }
        public function set_charset($charset) { return true; }
        public function close() { return true; }
    };
    
    // Initialize demo data in session
    if (!isset($_SESSION['demo_data'])) {
        $_SESSION['demo_data'] = [
            'users' => [
                1 => [
                    'id' => 1,
                    'full_name' => 'John Farmer',
                    'email' => 'john@example.com',
                    'phone' => '9876543210',
                    'role' => 'farmer'
                ]
            ],
            'farms' => [
                1 => [
                    'id' => 1,
                    'user_id' => 1,
                    'name' => 'Green Valley Farm',
                    'location' => 'Pune, Maharashtra',
                    'size' => '10.5 acres'
                ]
            ],
            'crops' => [],
            'activities' => [],
            'weather' => []
        ];
    }
} else {
    // Connection successful, try to select/create database
    $conn->query("CREATE DATABASE IF NOT EXISTS $database");
    $conn->select_db($database);
    $_SESSION['use_local_storage'] = false;
    
    // Create tables if they don't exist
    createTables($conn);
}

// Function to create tables
function createTables($conn) {
    $tables = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            full_name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            phone VARCHAR(20),
            password VARCHAR(255),
            profile_picture TEXT,
            role VARCHAR(50) DEFAULT 'farmer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE IF NOT EXISTS farms (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            name VARCHAR(100),
            location VARCHAR(255),
            size DECIMAL(10,2),
            soil_type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE IF NOT EXISTS crops (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            farm_id INT,
            crop_name VARCHAR(100),
            variety VARCHAR(100),
            planting_date DATE,
            harvest_date DATE,
            area DECIMAL(10,2),
            status VARCHAR(50) DEFAULT 'active',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE IF NOT EXISTS activities (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            type VARCHAR(50),
            title VARCHAR(255),
            description TEXT,
            crop_id INT,
            activity_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"
    ];
    
    foreach ($tables as $table) {
        $conn->query($table);
    }
}
?>