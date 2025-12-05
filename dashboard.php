<?php
// dashboard.php - Working version
require_once 'config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    // Set demo user for testing
    $_SESSION['user_id'] = 1;
    $_SESSION['user_name'] = 'Demo Farmer';
    $_SESSION['user_email'] = 'demo@smartfarm.com';
    $_SESSION['demo_mode'] = true;
}

$user_id = $_SESSION['user_id'];

// Get user data
if ($_SESSION['use_local_storage'] ?? false) {
    // Use session data
    $user = $_SESSION['demo_data']['users'][$user_id] ?? [
        'id' => $user_id,
        'full_name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email'],
        'role' => 'farmer'
    ];
    
    // Get farm data
    $farm = $_SESSION['demo_data']['farms'][1] ?? [
        'name' => 'My Farm',
        'location' => 'Add your location',
        'size' => '0 acres'
    ];
    
    // Get crop data
    $crops = $_SESSION['demo_data']['crops'] ?? [];
    $total_crops = count($crops);
    $active_crops = count(array_filter($crops, function($crop) {
        return ($crop['status'] ?? 'active') === 'active';
    }));
    $harvest_ready = count(array_filter($crops, function($crop) {
        return ($crop['status'] ?? '') === 'ready_to_harvest';
    }));
    
    // Get activities
    $activities = $_SESSION['demo_data']['activities'] ?? [];
    
} else {
    // Use database
    $query = "SELECT * FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc() ?? [
        'full_name' => 'Demo Farmer',
        'email' => 'demo@smartfarm.com'
    ];
    
    // Get farm data
    $farm_query = "SELECT * FROM farms WHERE user_id = ? LIMIT 1";
    $farm_stmt = $conn->prepare($farm_query);
    $farm_stmt->bind_param("i", $user_id);
    $farm_stmt->execute();
    $farm_result = $farm_stmt->get_result();
    $farm = $farm_result->fetch_assoc() ?? [
        'name' => 'My Farm',
        'location' => 'Add location'
    ];
    
    // Get crop data
    $crop_query = "SELECT * FROM crops WHERE user_id = ?";
    $crop_stmt = $conn->prepare($crop_query);
    $crop_stmt->bind_param("i", $user_id);
    $crop_stmt->execute();
    $crops_result = $crop_stmt->get_result();
    
    $total_crops = $crops_result->num_rows;
    $active_crops = 0;
    $harvest_ready = 0;
    
    while ($crop = $crops_result->fetch_assoc()) {
        if ($crop['status'] == 'active') $active_crops++;
        if ($crop['status'] == 'ready_to_harvest') $harvest_ready++;
    }
    $crops_result->data_seek(0);
    
    // Get activities
    $activity_query = "SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 5";
    $activity_stmt = $conn->prepare($activity_query);
    $activity_stmt->bind_param("i", $user_id);
    $activity_stmt->execute();
    $activities_result = $activity_stmt->get_result();
}

// Weather data (static for demo)
$weather = [
    'temperature' => 28,
    'condition' => 'Clear',
    'wind_speed' => 12,
    'humidity' => 65,
    'rain_chance' => 10
];

// Market prices (static for demo)
$market_prices = [
    ['crop_name' => 'Rice', 'price' => 25, 'trend' => 'up', 'change_percent' => 2.5],
    ['crop_name' => 'Wheat', 'price' => 22, 'trend' => 'down', 'change_percent' => 1.3],
    ['crop_name' => 'Corn', 'price' => 18, 'trend' => 'up', 'change_percent' => 3.1],
    ['crop_name' => 'Tomato', 'price' => 30, 'trend' => 'up', 'change_percent' => 5.2],
    ['crop_name' => 'Potato', 'price' => 15, 'trend' => 'stable', 'change_percent' => 0]
];

// Tasks (static for demo)
$tasks = [
    [
        'id' => 1,
        'category' => 'Watering',
        'priority' => 'high',
        'title' => 'Irrigation for Wheat field',
        'description' => 'Complete irrigation for wheat field section A',
        'due_date' => date('Y-m-d', strtotime('+1 day')),
        'assigned_to' => 'You'
    ],
    [
        'id' => 2,
        'category' => 'Fertilizing',
        'priority' => 'medium',
        'title' => 'Apply organic fertilizer',
        'description' => 'Apply organic fertilizer to vegetable garden',
        'due_date' => date('Y-m-d', strtotime('+2 days')),
        'assigned_to' => 'Farm Helper'
    ],
    [
        'id' => 3,
        'category' => 'Harvesting',
        'priority' => 'low',
        'title' => 'Harvest tomatoes',
        'description' => 'Harvest ripe tomatoes from greenhouse',
        'due_date' => date('Y-m-d', strtotime('+3 days')),
        'assigned_to' => 'You'
    ]
];

// Helper functions
function getActivityIcon($type) {
    $icons = [
        'planting' => 'seedling',
        'watering' => 'tint',
        'fertilizing' => 'flask',
        'harvesting' => 'apple-alt',
        'pest_control' => 'bug',
        'soil_testing' => 'vial',
        'equipment' => 'tools',
        'other' => 'clipboard-list'
    ];
    return $icons[$type] ?? 'clipboard-list';
}

function getWeatherIcon($condition) {
    $icons = [
        'Clear' => 'sun',
        'Clouds' => 'cloud',
        'Rain' => 'cloud-rain',
        'Drizzle' => 'cloud-rain',
        'Thunderstorm' => 'bolt',
        'Snow' => 'snowflake',
        'Mist' => 'smog',
        'Fog' => 'smog'
    ];
    return $icons[$condition] ?? 'cloud';
}

function getTaskIcon($category) {
    $icons = [
        'Planting' => 'seedling',
        'Watering' => 'tint',
        'Fertilizing' => 'flask',
        'Harvesting' => 'apple-alt',
        'Pest Control' => 'bug',
        'Maintenance' => 'tools',
        'Soil Testing' => 'vial',
        'Market' => 'shopping-cart',
        'Meeting' => 'users'
    ];
    return $icons[$category] ?? 'tasks';
}

function timeAgo($timestamp) {
    if (empty($timestamp)) return 'Recently';
    $time = strtotime($timestamp);
    $now = time();
    $diff = $now - $time;
    
    if ($diff < 60) return 'Just now';
    if ($diff < 3600) return floor($diff/60) . ' minutes ago';
    if ($diff < 86400) return floor($diff/3600) . ' hours ago';
    if ($diff < 2592000) return floor($diff/86400) . ' days ago';
    if ($diff < 31536000) return floor($diff/2592000) . ' months ago';
    return floor($diff/31536000) . ' years ago';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Farmer Dashboard | Smart Farming System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="dashboard.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
</head>
<body>
    <!-- Main Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <!-- Logo -->
                <div class="logo">
                    <i class="fas fa-seedling"></i>
                    <span class="logo-text">SmartFarm</span>
                </div>

                <!-- Desktop Menu -->
                <div class="nav-menu">
                    <a href="index.html" class="nav-link">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </a>
                    <a href="crops.html" class="nav-link">
                        <i class="fas fa-leaf"></i>
                        <span>Crops</span>
                    </a>
                    <a href="weather.html" class="nav-link">
                        <i class="fas fa-cloud-sun"></i>
                        <span>Weather</span>
                    </a>
                    <a href="marketplace.html" class="nav-link">
                        <i class="fas fa-store"></i>
                        <span>Marketplace</span>
                    </a>
                    <a href="forum.html" class="nav-link">
                        <i class="fas fa-users"></i>
                        <span>Community</span>
                    </a>
                    <a href="dashboard.php" class="nav-link active">
                        <i class="fas fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                </div>

                <!-- Header Right Section -->
                <div class="header-right">
                    <!-- Language Selector -->
                    <div class="language-selector" id="languageSelector">
                        <button class="language-btn" onclick="toggleLanguageDropdown()">
                            <i class="fas fa-language"></i>
                            <span id="currentLanguage">EN</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="language-dropdown" id="languageDropdown">
                            <div class="language-option" onclick="changeLanguage('en')">
                                <span class="flag-icon">🇺🇸</span>
                                <span>English</span>
                                <i class="fas fa-check" style="display: none;"></i>
                            </div>
                            <div class="language-option" onclick="changeLanguage('mr')">
                                <span class="flag-icon">🇮🇳</span>
                                <span>मराठी</span>
                                <i class="fas fa-check" style="display: none;"></i>
                            </div>
                            <div class="language-option" onclick="changeLanguage('hi')">
                                <span class="flag-icon">🇮🇳</span>
                                <span>हिन्दी</span>
                                <i class="fas fa-check" style="display: none;"></i>
                            </div>
                            <div class="language-option" onclick="changeLanguage('ta')">
                                <span class="flag-icon">🇮🇳</span>
                                <span>தமிழ்</span>
                                <i class="fas fa-check" style="display: none;"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Google Translate (Hidden) -->
                    <div id="google_translate_element" style="display: none;"></div>

                    <!-- User Profile -->
                    <div class="user-profile" id="userProfile">
                        <div class="user-dropdown" onclick="toggleUserDropdown()">
                            <div class="user-avatar">
                                <?php if (!empty($user['profile_picture'])): ?>
                                    <img src="<?php echo htmlspecialchars($user['profile_picture']); ?>" alt="<?php echo htmlspecialchars($user['full_name']); ?>">
                                <?php else: ?>
                                    <i class="fas fa-user"></i>
                                <?php endif; ?>
                            </div>
                            <span class="user-name"><?php echo htmlspecialchars($user['full_name']); ?></span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="user-dropdown-menu" id="userDropdown">
                            <a href="profile.php" class="dropdown-item">
                                <i class="fas fa-user"></i> My Profile
                            </a>
                            <a href="dashboard.php" class="dropdown-item">
                                <i class="fas fa-chart-line"></i> Dashboard
                            </a>
                            <a href="my-farm.php" class="dropdown-item">
                                <i class="fas fa-tractor"></i> My Farm
                            </a>
                            <a href="my-crops.php" class="dropdown-item">
                                <i class="fas fa-leaf"></i> My Crops
                            </a>
                            <a href="my-posts.html" class="dropdown-item">
                                <i class="fas fa-comments"></i> My Posts
                            </a>
                            <a href="settings.html" class="dropdown-item">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="logout.php" class="dropdown-item">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </div>

                    <!-- Mobile Menu Button -->
                    <button class="mobile-menu-btn" id="mobileMenuBtn">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-header">
            <div class="logo">
                <i class="fas fa-seedling"></i>
                <span>SmartFarm</span>
            </div>
            <button class="close-menu" id="closeMenuBtn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="mobile-menu-links">
            <a href="index.html" class="mobile-nav-link">
                <i class="fas fa-home"></i> Home
            </a>
            <a href="crops.html" class="mobile-nav-link">
                <i class="fas fa-leaf"></i> Crops
            </a>
            <a href="weather.html" class="mobile-nav-link">
                <i class="fas fa-cloud-sun"></i> Weather
            </a>
            <a href="marketplace.html" class="mobile-nav-link">
                <i class="fas fa-store"></i> Marketplace
            </a>
            <a href="forum.html" class="mobile-nav-link">
                <i class="fas fa-users"></i> Community
            </a>
            <a href="dashboard.php" class="mobile-nav-link active">
                <i class="fas fa-chart-line"></i> Dashboard
            </a>
            
            <!-- Mobile Language Selector -->
            <div class="mobile-language-selector">
                <h4>Select Language</h4>
                <div class="mobile-language-options">
                    <button class="mobile-lang-btn active" onclick="changeLanguage('en')">
                        <span class="flag-icon">🇺🇸</span> English
                    </button>
                    <button class="mobile-lang-btn" onclick="changeLanguage('mr')">
                        <span class="flag-icon">🇮🇳</span> मराठी
                    </button>
                    <button class="mobile-lang-btn" onclick="changeLanguage('hi')">
                        <span class="flag-icon">🇮🇳</span> हिन्दी
                    </button>
                    <button class="mobile-lang-btn" onclick="changeLanguage('ta')">
                        <span class="flag-icon">🇮🇳</span> தமிழ்
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Dashboard Header -->
    <section class="dashboard-header">
        <div class="container">
            <div class="header-content">
                <div class="welcome-section">
                    <h1>Welcome back, <?php echo htmlspecialchars($user['full_name']); ?>! 👋</h1>
                    <p>Here's what's happening on your farm today</p>
                    <div class="farm-info">
                        <span class="farm-badge">
                            <i class="fas fa-tractor"></i>
                            <?php echo htmlspecialchars($farm['name']); ?>
                        </span>
                        <span class="location-badge">
                            <i class="fas fa-map-marker-alt"></i>
                            <?php echo htmlspecialchars($farm['location']); ?>
                        </span>
                        <?php if ($_SESSION['demo_mode'] ?? false): ?>
                            <span class="demo-badge" style="background: #ff9800;">
                                <i class="fas fa-info-circle"></i> Demo Mode
                            </span>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="date-section">
                    <div class="current-date">
                        <i class="far fa-calendar-alt"></i>
                        <span id="currentDate"><?php echo date('F j, Y'); ?></span>
                    </div>
                    <button class="btn btn-outline" onclick="addNewActivity()">
                        <i class="fas fa-plus"></i> Add Activity
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Dashboard Stats -->
    <section class="dashboard-stats">
        <div class="container">
            <div class="stats-grid">
                <!-- Total Crops -->
                <div class="stat-card stat-primary">
                    <div class="stat-icon">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo $total_crops; ?></h3>
                        <p>Total Crops</p>
                        <div class="stat-trend positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>Add your first crop</span>
                        </div>
                    </div>
                </div>
                
                <!-- Active Crops -->
                <div class="stat-card stat-success">
                    <div class="stat-icon">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo $active_crops; ?></h3>
                        <p>Active Crops</p>
                        <div class="stat-trend positive">
                            <i class="fas fa-seedling"></i>
                            <span>Growing strong</span>
                        </div>
                    </div>
                </div>
                
                <!-- Ready to Harvest -->
                <div class="stat-card stat-warning">
                    <div class="stat-icon">
                        <i class="fas fa-apple-alt"></i>
                    </div>
                    <div class="stat-content">
                        <h3><?php echo $harvest_ready; ?></h3>
                        <p>Ready to Harvest</p>
                        <div class="stat-trend negative">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>None ready yet</span>
                        </div>
                    </div>
                </div>
                
                <!-- Soil Health -->
                <div class="stat-card stat-info">
                    <div class="stat-icon">
                        <i class="fas fa-flask"></i>
                    </div>
                    <div class="stat-content">
                        <h3>8.2</h3>
                        <p>Soil Health Score</p>
                        <div class="stat-trend neutral">
                            <i class="fas fa-minus"></i>
                            <span>Good condition</span>
                        </div>
                    </div>
                </div>
                
                <!-- Water Usage -->
                <div class="stat-card stat-blue">
                    <div class="stat-icon">
                        <i class="fas fa-tint"></i>
                    </div>
                    <div class="stat-content">
                        <h3>1,250L</h3>
                        <p>Water Used Today</p>
                        <div class="stat-trend positive">
                            <i class="fas fa-arrow-down"></i>
                            <span>15% saved</span>
                        </div>
                    </div>
                </div>
                
                <!-- Expected Yield -->
                <div class="stat-card stat-purple">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h3>2.5T</h3>
                        <p>Expected Yield</p>
                        <div class="stat-trend positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>8% increase</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Dashboard Content -->
    <section class="dashboard-main">
        <div class="container">
            <div class="dashboard-layout">
                <!-- Left Column -->
                <div class="dashboard-left">
                    <!-- Crop Health Chart -->
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3>Crop Health Status</h3>
                            <select class="chart-period" id="cropHealthPeriod">
                                <option value="7d">Last 7 Days</option>
                                <option value="30d" selected>Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                            </select>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="cropHealthChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Activities -->
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3>Recent Activities</h3>
                            <a href="#" class="view-all" onclick="showAllActivities()">View All</a>
                        </div>
                        <div class="card-body">
                            <div class="activities-list">
                                <?php if (isset($activities_result) && $activities_result->num_rows > 0): ?>
                                    <?php while ($activity = $activities_result->fetch_assoc()): ?>
                                        <div class="activity-item">
                                            <div class="activity-icon">
                                                <i class="fas fa-<?php echo getActivityIcon($activity['type']); ?>"></i>
                                            </div>
                                            <div class="activity-content">
                                                <h4><?php echo htmlspecialchars($activity['title']); ?></h4>
                                                <p><?php echo htmlspecialchars($activity['description']); ?></p>
                                                <span class="activity-time">
                                                    <i class="far fa-clock"></i>
                                                    <?php echo timeAgo($activity['created_at']); ?>
                                                </span>
                                            </div>
                                        </div>
                                    <?php endwhile; ?>
                                <?php elseif (!empty($activities) && count($activities) > 0): ?>
                                    <?php foreach ($activities as $activity): ?>
                                        <div class="activity-item">
                                            <div class="activity-icon">
                                                <i class="fas fa-<?php echo getActivityIcon($activity['type']); ?>"></i>
                                            </div>
                                            <div class="activity-content">
                                                <h4><?php echo htmlspecialchars($activity['title']); ?></h4>
                                                <p><?php echo htmlspecialchars($activity['description']); ?></p>
                                                <span class="activity-time">
                                                    <i class="far fa-clock"></i>
                                                    <?php echo timeAgo($activity['created_at'] ?? ''); ?>
                                                </span>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <div class="empty-state">
                                        <i class="fas fa-clipboard-list"></i>
                                        <p>No activities recorded yet</p>
                                        <button class="btn btn-outline btn-sm" onclick="addNewActivity()">
                                            Add Your First Activity
                                        </button>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column -->
                <div class="dashboard-right">
                    <!-- Weather Widget -->
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3>Farm Weather</h3>
                            <a href="weather.html" class="view-all">Forecast</a>
                        </div>
                        <div class="card-body">
                            <div class="weather-widget">
                                <div class="weather-main">
                                    <div class="weather-icon-large">
                                        <i class="fas fa-<?php echo getWeatherIcon($weather['condition']); ?>"></i>
                                    </div>
                                    <div class="weather-details">
                                        <div class="temperature-large">
                                            <?php echo $weather['temperature']; ?>°C
                                        </div>
                                        <div class="weather-condition">
                                            <?php echo htmlspecialchars($weather['condition']); ?>
                                        </div>
                                        <div class="weather-location">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <?php echo htmlspecialchars($farm['location']); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="weather-stats">
                                    <div class="weather-stat">
                                        <i class="fas fa-wind"></i>
                                        <div>
                                            <span class="stat-label">Wind</span>
                                            <span class="stat-value"><?php echo $weather['wind_speed']; ?> km/h</span>
                                        </div>
                                    </div>
                                    <div class="weather-stat">
                                        <i class="fas fa-tint"></i>
                                        <div>
                                            <span class="stat-label">Humidity</span>
                                            <span class="stat-value"><?php echo $weather['humidity']; ?>%</span>
                                        </div>
                                    </div>
                                    <div class="weather-stat">
                                        <i class="fas fa-cloud-rain"></i>
                                        <div>
                                            <span class="stat-label">Rain</span>
                                            <span class="stat-value"><?php echo $weather['rain_chance']; ?>%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div class="card-body">
                            <div class="quick-actions-grid">
                                <a href="#" class="quick-action" onclick="addNewCrop()">
                                    <div class="action-icon">
                                        <i class="fas fa-plus-circle"></i>
                                    </div>
                                    <span>Add New Crop</span>
                                </a>
                                <a href="irrigation-schedule.php" class="quick-action">
                                    <div class="action-icon">
                                        <i class="fas fa-tint"></i>
                                    </div>
                                    <span>Irrigation</span>
                                </a>
                                <a href="fertilizer-calculator.html" class="quick-action">
                                    <div class="action-icon">
                                        <i class="fas fa-flask"></i>
                                    </div>
                                    <span>Fertilizer</span>
                                </a>
                                <a href="pest-alerts.php" class="quick-action">
                                    <div class="action-icon">
                                        <i class="fas fa-bug"></i>
                                    </div>
                                    <span>Pest Alerts</span>
                                </a>
                                <a href="market-prices.php" class="quick-action">
                                    <div class="action-icon">
                                        <i class="fas fa-chart-line"></i>
                                    </div>
                                    <span>Market Prices</span>
                                </a>
                                <a href="expense-tracker.php" class="quick-action">
                                    <div class="action-icon">
                                        <i class="fas fa-coins"></i>
                                    </div>
                                    <span>Expenses</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Market Prices -->
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3>Market Prices</h3>
                            <a href="marketplace.html" class="view-all">View All</a>
                        </div>
                        <div class="card-body">
                            <div class="market-prices">
                                <table class="prices-table">
                                    <thead>
                                        <tr>
                                            <th>Crop</th>
                                            <th>Price (₹/kg)</th>
                                            <th>Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($market_prices as $price): ?>
                                            <tr>
                                                <td>
                                                    <div class="crop-info">
                                                        <i class="fas fa-leaf"></i>
                                                        <span><?php echo htmlspecialchars($price['crop_name']); ?></span>
                                                    </div>
                                                </td>
                                                <td class="price-value">₹<?php echo $price['price']; ?></td>
                                                <td>
                                                    <div class="price-trend <?php echo $price['trend']; ?>">
                                                        <i class="fas fa-arrow-<?php echo $price['trend'] == 'up' ? 'up' : ($price['trend'] == 'down' ? 'down' : 'right'); ?>"></i>
                                                        <span><?php echo $price['change_percent']; ?>%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Upcoming Tasks Section -->
    <section class="upcoming-tasks">
        <div class="container">
            <div class="section-header">
                <h2>Upcoming Tasks</h2>
                <p>Tasks scheduled for the next 7 days</p>
            </div>
            
            <div class="tasks-grid">
                <?php if (count($tasks) > 0): ?>
                    <?php foreach ($tasks as $task): ?>
                        <div class="task-card priority-<?php echo $task['priority']; ?>" data-task-id="<?php echo $task['id']; ?>">
                            <div class="task-header">
                                <div class="task-category">
                                    <i class="fas fa-<?php echo getTaskIcon($task['category']); ?>"></i>
                                    <span><?php echo htmlspecialchars($task['category']); ?></span>
                                </div>
                                <span class="priority-badge"><?php echo $task['priority']; ?> priority</span>
                            </div>
                            
                            <h3 class="task-title"><?php echo htmlspecialchars($task['title']); ?></h3>
                            <p class="task-description"><?php echo htmlspecialchars($task['description']); ?></p>
                            
                            <div class="task-footer">
                                <div class="task-meta">
                                    <span class="task-date">
                                        <i class="far fa-calendar"></i>
                                        <?php echo date('M d', strtotime($task['due_date'])); ?>
                                    </span>
                                    <span class="task-assigned">
                                        <i class="fas fa-user"></i>
                                        <?php echo htmlspecialchars($task['assigned_to'] ?? 'You'); ?>
                                    </span>
                                </div>
                                <div class="task-actions">
                                    <button class="btn btn-sm btn-outline" onclick="markTaskComplete(<?php echo $task['id']; ?>)">
                                        <i class="fas fa-check"></i> Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="empty-state-large">
                        <i class="fas fa-tasks"></i>
                        <h3>No upcoming tasks</h3>
                        <p>You're all caught up! Add new tasks to stay organized.</p>
                        <button class="btn btn-primary" onclick="addNewTask()">
                            <i class="fas fa-plus"></i> Add New Task
                        </button>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Add Activity Modal -->
    <div class="modal-overlay" id="activityModal">
        <div class="modal-container">
            <div class="modal-header">
                <h2>Add New Activity</h2>
                <button class="modal-close" onclick="closeActivityModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <form id="activityForm">
                    <div class="form-group">
                        <label for="activityType">
                            <i class="fas fa-tag"></i> Activity Type
                        </label>
                        <select id="activityType" required>
                            <option value="">Select Type</option>
                            <option value="planting">Planting</option>
                            <option value="watering">Watering</option>
                            <option value="fertilizing">Fertilizing</option>
                            <option value="harvesting">Harvesting</option>
                            <option value="pest_control">Pest Control</option>
                            <option value="soil_testing">Soil Testing</option>
                            <option value="equipment">Equipment Maintenance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="activityTitle">
                            <i class="fas fa-heading"></i> Title
                        </label>
                        <input type="text" id="activityTitle" placeholder="Enter activity title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="activityDescription">
                            <i class="fas fa-edit"></i> Description
                        </label>
                        <textarea id="activityDescription" rows="4" placeholder="Describe the activity..."></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="activityDate">
                                <i class="far fa-calendar"></i> Date
                            </label>
                            <input type="date" id="activityDate" value="<?php echo date('Y-m-d'); ?>" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="activityTime">
                                <i class="far fa-clock"></i> Time
                            </label>
                            <input type="time" id="activityTime" value="<?php echo date('H:i'); ?>" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="notifyTeam">
                            <span>Notify team members</span>
                        </label>
                    </div>
                </form>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeActivityModal()">
                    Cancel
                </button>
                <button class="btn btn-primary" onclick="saveActivity()">
                    <i class="fas fa-save"></i> Save Activity
                </button>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-column">
                    <div class="footer-logo">
                        <i class="fas fa-seedling"></i>
                        <span>SmartFarm</span>
                    </div>
                    <p class="footer-description">
                        Empowering farmers with modern technology and community support for sustainable agriculture.
                    </p>
                    <div class="social-links">
                        <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>
                
                <div class="footer-column">
                    <h3 class="footer-title">Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact</a></li>
                        <li><a href="privacy.html">Privacy Policy</a></li>
                        <li><a href="terms.html">Terms of Service</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h3 class="footer-title">Dashboard</h3>
                    <ul class="footer-links">
                        <li><a href="#" onclick="addNewFarm()">My Farm</a></li>
                        <li><a href="#" onclick="addNewCrop()">My Crops</a></li>
                        <li><a href="#" onclick="showAllActivities()">Activities</a></li>
                        <li><a href="reports.php">Reports</a></li>
                        <li><a href="analytics.php">Analytics</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h3 class="footer-title">Contact Us</h3>
                    <ul class="footer-contact">
                        <li>
                            <i class="fas fa-envelope"></i>
                            <span>support@smartfarm.com</span>
                        </li>
                        <li>
                            <i class="fas fa-phone"></i>
                            <span>+91 98765 43210</span>
                        </li>
                        <li>
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Farm Street, Agriculture City, India</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 Smart Farming System. All rights reserved.</p>
                <p class="user-info">Logged in as: <?php echo htmlspecialchars($user['email']); ?></p>
                <?php if ($_SESSION['demo_mode'] ?? false): ?>
                    <p class="demo-info">Running in demo mode - <a href="setup-database.html">Setup database</a> for full features</p>
                <?php endif; ?>
            </div>
        </div>
    </footer>

    <!-- Chatbot Widget -->
    <div class="chatbot-container" id="chatbotContainer">
        <div class="chatbot-header">
            <div class="chatbot-title">
                <i class="fas fa-robot"></i>
                <h3>Farming Assistant</h3>
                <span class="chatbot-status online"></span>
            </div>
            <button class="chatbot-close" onclick="closeChatbot()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="chatbot-body" id="chatbotBody">
            <div class="chat-message bot">
                <div class="message-content">
                    Hello! I'm your farming assistant. How can I help you with your farm management today?
                </div>
                <div class="message-time">Just now</div>
            </div>
        </div>
        
        <div class="chatbot-input">
            <input type="text" id="chatInput" placeholder="Ask about crops, weather, or farming advice...">
            <button id="sendMessage" onclick="sendChatMessage()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>

    <!-- Chatbot Toggle Button -->
    <button class="chatbot-toggle" onclick="toggleChatbot()">
        <i class="fas fa-robot"></i>
        <span class="chatbot-notification"></span>
    </button>

    <!-- Google Translate Script -->
    <script type="text/javascript">
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,mr,hi,ta',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
        }
    </script>
    <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="script.js"></script>
    <script src="dashboard.js"></script>
</body>
</html>
<?php
// Close database connection if it exists
if (isset($conn) && !($_SESSION['use_local_storage'] ?? false)) {
    @$stmt->close();
    @$farm_stmt->close();
    @$crop_stmt->close();
    @$activity_stmt->close();
    @$conn->close();
}
?>