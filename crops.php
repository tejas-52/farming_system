<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crop Information | Smart Farming</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Navigation same as index.html -->
    
    <div class="container">
        <h1 class="page-title">Crop Information & Disease Detection</h1>
        
        <div class="search-bar">
            <input type="text" id="cropSearch" placeholder="Search crops...">
            <button onclick="searchCrops()"><i class="fas fa-search"></i></button>
        </div>
        
        <div class="category-filter">
            <button onclick="filterCrops('all')" class="active">All Crops</button>
            <button onclick="filterCrops('vegetable')">Vegetables</button>
            <button onclick="filterCrops('fruit')">Fruits</button>
            <button onclick="filterCrops('grain')">Grains</button>
            <button onclick="filterCrops('cash')">Cash Crops</button>
        </div>
        
        <div class="crops-grid">
            <!-- Crop cards will be loaded here -->
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>