// Crops Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    initCropFilters();
    
    // Initialize search
    initSearch();
    
    // Load crop data
    loadCropData();
    
    // Initialize calculator
    initCalculator();
    
    // Add click handlers to filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Handle filter action
            const filterType = this.dataset.filter;
            handleFilterChange(filterType);
        });
    });
});

// Initialize Crop Filters
function initCropFilters() {
    const seasonFilter = document.getElementById('seasonFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (seasonFilter) {
        seasonFilter.addEventListener('change', filterCrops);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCrops);
    }
}

// Initialize Search
function initSearch() {
    const searchInput = document.getElementById('cropSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchCrops();
            }
        });
    }
}

// Search Crops
function searchCrops() {
    const searchTerm = document.getElementById('cropSearch').value.toLowerCase().trim();
    const cropCards = document.querySelectorAll('.crop-card');
    
    if (!searchTerm) {
        // If search is empty, show all crops
        cropCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    cropCards.forEach(card => {
        const cropName = card.querySelector('.crop-name').textContent.toLowerCase();
        const cropScientific = card.querySelector('.crop-scientific').textContent.toLowerCase();
        const cropDescription = card.querySelector('.crop-description').textContent.toLowerCase();
        
        if (cropName.includes(searchTerm) || 
            cropScientific.includes(searchTerm) || 
            cropDescription.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter Crops
function filterCrops() {
    const seasonValue = document.getElementById('seasonFilter').value;
    const categoryValue = document.getElementById('categoryFilter').value;
    const cropCards = document.querySelectorAll('.crop-card');
    
    cropCards.forEach(card => {
        const cropSeason = card.dataset.season;
        const cropCategory = card.dataset.category;
        
        let showCard = true;
        
        // Filter by season
        if (seasonValue && cropSeason !== seasonValue && cropSeason !== 'all') {
            showCard = false;
        }
        
        // Filter by category
        if (categoryValue && cropCategory !== categoryValue) {
            showCard = false;
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
}

// Handle Filter Change
function handleFilterChange(filterType) {
    const dropdownFilters = document.querySelector('.dropdown-filters');
    
    switch(filterType) {
        case 'season':
            document.getElementById('seasonFilter').style.display = 'block';
            document.getElementById('categoryFilter').style.display = 'none';
            break;
        case 'category':
            document.getElementById('seasonFilter').style.display = 'none';
            document.getElementById('categoryFilter').style.display = 'block';
            break;
        case 'disease':
            // Show only crops with diseases
            filterByDiseases();
            break;
        case 'all':
        default:
            document.getElementById('seasonFilter').style.display = 'none';
            document.getElementById('categoryFilter').style.display = 'none';
            showAllCrops();
            break;
    }
}

function filterBySeason() {
    const seasonValue = document.getElementById('seasonFilter').value;
    const cropCards = document.querySelectorAll('.crop-card');
    
    cropCards.forEach(card => {
        const cropSeason = card.dataset.season;
        
        if (!seasonValue || seasonValue === '') {
            card.style.display = 'block';
        } else if (cropSeason === seasonValue || cropSeason === 'all') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByCategory() {
    const categoryValue = document.getElementById('categoryFilter').value;
    const cropCards = document.querySelectorAll('.crop-card');
    
    cropCards.forEach(card => {
        const cropCategory = card.dataset.category;
        
        if (!categoryValue || categoryValue === '') {
            card.style.display = 'block';
        } else if (cropCategory === categoryValue) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByDiseases() {
    const cropCards = document.querySelectorAll('.crop-card');
    
    cropCards.forEach(card => {
        const hasDiseases = card.dataset.diseases === 'true';
        card.style.display = hasDiseases ? 'block' : 'none';
    });
}

function showAllCrops() {
    const cropCards = document.querySelectorAll('.crop-card');
    cropCards.forEach(card => {
        card.style.display = 'block';
    });
}

// Load All Crops
function loadAllCrops() {
    // Show loading indicator
    const cropsGrid = document.getElementById('cropsGrid');
    const loadButton = event.target.closest('.view-all').querySelector('.btn');
    
    const originalText = loadButton.innerHTML;
    loadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Add more crop cards (simulated)
        const additionalCrops = [
            {
                name: "Corn",
                scientific: "Zea mays",
                season: "kharif",
                category: "cereals",
                image: "https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                description: "Major cereal crop used for food, feed, and industrial products."
            },
            {
                name: "Soybean",
                scientific: "Glycine max",
                season: "kharif",
                category: "pulses",
                image: "https://images.unsplash.com/photo-1589923186747-91b0e6f63bae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                description: "Protein-rich legume used for oil extraction and animal feed."
            },
            {
                name: "Banana",
                scientific: "Musa spp.",
                season: "all",
                category: "fruits",
                image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                description: "Tropical fruit crop with high nutritional value."
            }
        ];
        
        additionalCrops.forEach(crop => {
            const cropCard = createCropCard(crop);
            cropsGrid.appendChild(cropCard);
        });
        
        // Update button
        loadButton.innerHTML = '<i class="fas fa-check"></i> All Crops Loaded';
        loadButton.classList.remove('btn-outline');
        loadButton.classList.add('btn-success');
        
        // Show success message
        showNotification('Additional crops loaded successfully!', 'success');
        
        // Re-initialize filters for new cards
        setTimeout(() => {
            initCropFilters();
        }, 100);
        
    }, 1500);
}

function createCropCard(crop) {
    const card = document.createElement('div');
    card.className = 'crop-card';
    card.dataset.season = crop.season;
    card.dataset.category = crop.category;
    card.dataset.diseases = 'true';
    
    const seasonClass = crop.season === 'kharif' ? 'kharif' : crop.season === 'rabi' ? 'rabi' : 'zaid';
    const seasonText = crop.season === 'kharif' ? 'Kharif' : crop.season === 'rabi' ? 'Rabi' : 'Year-round';
    
    card.innerHTML = `
        <div class="crop-image">
            <img src="${crop.image}" alt="${crop.name}">
            <span class="crop-season ${seasonClass}">${seasonText}</span>
        </div>
        <div class="crop-info">
            <h3 class="crop-name">${crop.name}</h3>
            <p class="crop-scientific">${crop.scientific}</p>
            <div class="crop-meta">
                <span><i class="fas fa-calendar"></i> 90-120 days</span>
                <span><i class="fas fa-temperature-high"></i> 20-30°C</span>
            </div>
            <p class="crop-description">${crop.description}</p>
            <div class="crop-actions">
                <button class="btn btn-sm btn-outline" onclick="viewCropDetails('${crop.name.toLowerCase()}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-sm btn-primary" onclick="openDiseaseInfo('${crop.name.toLowerCase()}')">
                    <i class="fas fa-bug"></i> Diseases
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// View Crop Details
function viewCropDetails(cropName) {
    const cropData = getCropData(cropName);
    const modal = document.getElementById('cropModal');
    const modalName = document.getElementById('modalCropName');
    const modalContent = document.getElementById('modalCropContent');
    
    modalName.textContent = cropData.name;
    
    modalContent.innerHTML = `
        <div class="crop-modal-content">
            <div class="crop-modal-header">
                <div class="crop-basic-info">
                    <h3>${cropData.name} (${cropData.scientific})</h3>
                    <div class="crop-tags">
                        <span class="crop-tag season">${cropData.season} Season</span>
                        <span class="crop-tag category">${cropData.category}</span>
                        <span class="crop-tag duration">${cropData.duration}</span>
                    </div>
                </div>
            </div>
            
            <div class="crop-modal-body">
                <div class="crop-details-grid">
                    <div class="crop-detail-section">
                        <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
                        <div class="detail-list">
                            <div class="detail-item">
                                <span class="detail-label">Optimal Temperature:</span>
                                <span class="detail-value">${cropData.temperature}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Rainfall Required:</span>
                                <span class="detail-value">${cropData.rainfall}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Soil Type:</span>
                                <span class="detail-value">${cropData.soil}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">pH Range:</span>
                                <span class="detail-value">${cropData.ph}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="crop-detail-section">
                        <h4><i class="fas fa-calendar-alt"></i> Cultivation Timeline</h4>
                        <div class="timeline">
                            <div class="timeline-item">
                                <span class="timeline-label">Sowing Time:</span>
                                <span class="timeline-value">${cropData.sowingTime}</span>
                            </div>
                            <div class="timeline-item">
                                <span class="timeline-label">Harvest Time:</span>
                                <span class="timeline-value">${cropData.harvestTime}</span>
                            </div>
                            <div class="timeline-item">
                                <span class="timeline-label">Growth Period:</span>
                                <span class="timeline-value">${cropData.growthPeriod}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="crop-detail-section">
                        <h4><i class="fas fa-tint"></i> Irrigation Requirements</h4>
                        <p>${cropData.irrigation}</p>
                    </div>
                    
                    <div class="crop-detail-section">
                        <h4><i class="fas fa-flask"></i> Fertilizer Recommendations</h4>
                        <ul>
                            ${cropData.fertilizers.map(fertilizer => `<li>${fertilizer}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="crop-detail-section full-width">
                        <h4><i class="fas fa-bug"></i> Common Pests & Diseases</h4>
                        <div class="pests-grid">
                            ${cropData.pests.map(pest => `
                                <div class="pest-item">
                                    <h5>${pest.name}</h5>
                                    <p><strong>Symptoms:</strong> ${pest.symptoms}</p>
                                    <p><strong>Control:</strong> ${pest.control}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="crop-detail-section full-width">
                        <h4><i class="fas fa-chart-line"></i> Expected Yield & Economics</h4>
                        <div class="yield-info">
                            <div class="yield-item">
                                <span class="yield-label">Average Yield:</span>
                                <span class="yield-value">${cropData.yield.average}</span>
                            </div>
                            <div class="yield-item">
                                <span class="yield-label">Good Yield:</span>
                                <span class="yield-value">${cropData.yield.good}</span>
                            </div>
                            <div class="yield-item">
                                <span class="yield-label">Cost of Cultivation:</span>
                                <span class="yield-value">${cropData.yield.cost}</span>
                            </div>
                            <div class="yield-item">
                                <span class="yield-label">Net Profit:</span>
                                <span class="yield-value" style="color: var(--primary);">${cropData.yield.profit}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="crop-modal-footer">
                <button class="btn btn-primary" onclick="printCropInfo()">
                    <i class="fas fa-print"></i> Print Information
                </button>
                <button class="btn btn-outline" onclick="shareCropInfo('${cropName}')">
                    <i class="fas fa-share-alt"></i> Share
                </button>
                <button class="btn btn-outline" onclick="saveCropInfo('${cropName}')">
                    <i class="fas fa-bookmark"></i> Save
                </button>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
            .crop-modal-content {
                padding: 20px;
            }
            
            .crop-tags {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 10px;
            }
            
            .crop-tag {
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .crop-tag.season {
                background: rgba(76, 175, 80, 0.1);
                color: var(--primary);
            }
            
            .crop-tag.category {
                background: rgba(33, 150, 243, 0.1);
                color: #2196f3;
            }
            
            .crop-tag.duration {
                background: rgba(255, 152, 0, 0.1);
                color: #ff9800;
            }
            
            .crop-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
                margin: 25px 0;
            }
            
            .crop-detail-section {
                background: var(--bg-light);
                padding: 20px;
                border-radius: var(--radius-sm);
            }
            
            .crop-detail-section.full-width {
                grid-column: 1 / -1;
            }
            
            .crop-detail-section h4 {
                color: var(--primary-dark);
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1.1rem;
            }
            
            .detail-list, .timeline {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .detail-item, .timeline-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .detail-item:last-child, .timeline-item:last-child {
                border-bottom: none;
            }
            
            .detail-label, .timeline-label {
                font-weight: 500;
                color: var(--text-dark);
            }
            
            .detail-value, .timeline-value {
                color: var(--text-light);
            }
            
            .pests-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .pest-item {
                background: white;
                padding: 15px;
                border-radius: var(--radius-sm);
                border-left: 3px solid #dc3545;
            }
            
            .pest-item h5 {
                color: #dc3545;
                margin-bottom: 10px;
            }
            
            .pest-item p {
                font-size: 0.9rem;
                margin-bottom: 8px;
                line-height: 1.4;
            }
            
            .yield-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .yield-item {
                background: white;
                padding: 15px;
                border-radius: var(--radius-sm);
                text-align: center;
            }
            
            .yield-label {
                display: block;
                font-size: 0.9rem;
                color: var(--text-light);
                margin-bottom: 5px;
            }
            
            .yield-value {
                display: block;
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--text-dark);
            }
            
            .crop-modal-footer {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                padding-top: 20px;
                border-top: 1px solid var(--border);
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Get Crop Data
function getCropData(cropName) {
    const crops = {
        'rice': {
            name: 'Rice',
            scientific: 'Oryza sativa',
            season: 'Kharif',
            category: 'Cereal',
            duration: '90-120 days',
            temperature: '20-35°C',
            rainfall: '100-200 cm',
            soil: 'Clay loam, alluvial',
            ph: '5.5-6.5',
            sowingTime: 'June-July',
            harvestTime: 'September-October',
            growthPeriod: '4 months',
            irrigation: 'Requires standing water. Flood irrigation recommended.',
            fertilizers: [
                'Nitrogen: 120-150 kg/ha',
                'Phosphorus: 60-80 kg/ha',
                'Potassium: 40-60 kg/ha',
                'Zinc: 25 kg/ha (if deficient)'
            ],
            pests: [
                {
                    name: 'Stem Borer',
                    symptoms: 'Dead hearts, white ears',
                    control: 'Carbofuran 3G @ 15kg/ha'
                },
                {
                    name: 'Brown Plant Hopper',
                    symptoms: 'Hopper burn, drying of plants',
                    control: 'Imidacloprid 17.8% @ 125ml/ha'
                },
                {
                    name: 'Blast Disease',
                    symptoms: 'Spindle-shaped spots on leaves',
                    control: 'Tricyclazole 75% WP @ 500g/ha'
                }
            ],
            yield: {
                average: '4-5 tons/ha',
                good: '6-8 tons/ha',
                cost: '₹40,000-50,000/ha',
                profit: '₹60,000-80,000/ha'
            }
        },
        'wheat': {
            name: 'Wheat',
            scientific: 'Triticum aestivum',
            season: 'Rabi',
            category: 'Cereal',
            duration: '100-120 days',
            temperature: '15-25°C',
            rainfall: '50-75 cm',
            soil: 'Well-drained loamy soil',
            ph: '6.0-7.5',
            sowingTime: 'November-December',
            harvestTime: 'March-April',
            growthPeriod: '3-4 months',
            irrigation: '4-5 irrigations at critical stages',
            fertilizers: [
                'Nitrogen: 120-150 kg/ha',
                'Phosphorus: 60-80 kg/ha',
                'Potassium: 40-60 kg/ha'
            ],
            pests: [
                {
                    name: 'Aphids',
                    symptoms: 'Yellowing of leaves, stunted growth',
                    control: 'Imidacloprid 200SL @ 100ml/ha'
                },
                {
                    name: 'Rust Disease',
                    symptoms: 'Orange-brown pustules on leaves',
                    control: 'Propiconazole 25% EC @ 500ml/ha'
                },
                {
                    name: 'Karnal Bunt',
                    symptoms: 'Black powdery mass in grains',
                    control: 'Seed treatment with Carbendazim'
                }
            ],
            yield: {
                average: '3-4 tons/ha',
                good: '5-6 tons/ha',
                cost: '₹30,000-40,000/ha',
                profit: '₹50,000-70,000/ha'
            }
        }
        // Add more crops as needed
    };
    
    return crops[cropName] || crops['rice'];
}

// Open Disease Info
function openDiseaseInfo(cropName) {
    // Show disease tab
    showDiseaseTab('common');
    
    // Scroll to disease section
    const diseaseSection = document.querySelector('.disease-section');
    diseaseSection.scrollIntoView({ behavior: 'smooth' });
    
    // Highlight relevant disease
    setTimeout(() => {
        const diseaseCards = document.querySelectorAll('.disease-card');
        diseaseCards.forEach(card => {
            const diseaseCrop = card.querySelector('.disease-crop').textContent.toLowerCase();
            if (diseaseCrop.includes(cropName)) {
                card.style.animation = 'pulse 1s 2';
                card.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.3)';
                
                setTimeout(() => {
                    card.style.animation = '';
                    card.style.boxShadow = '';
                }, 2000);
            }
        });
    }, 500);
}

// Show Disease Tab
function showDiseaseTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.disease-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.querySelector(`.disease-tab[onclick*="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Show tab content
    const tabContents = document.querySelectorAll('.disease-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    const activeContent = document.getElementById(tabName + 'Diseases') || 
                          document.getElementById(tabName + 'Tips') || 
                          document.getElementById(tabName + 'Methods');
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Initialize Calculator
function initCalculator() {
    // Set default values based on selected crop
    const cropSelect = document.getElementById('calculatorCrop');
    if (cropSelect) {
        cropSelect.addEventListener('change', updateCalculatorDefaults);
    }
    
    // Calculate on page load
    calculateCropProfit();
}

function updateCalculatorDefaults() {
    const crop = document.getElementById('calculatorCrop').value;
    const defaults = {
        'rice': { yield: 4000, price: 25 },
        'wheat': { yield: 3500, price: 22 },
        'cotton': { yield: 1500, price: 65 },
        'sugarcane': { yield: 70000, price: 3.5 },
        'tomato': { yield: 25000, price: 12 }
    };
    
    if (defaults[crop]) {
        document.getElementById('calculatorYield').value = defaults[crop].yield;
        document.getElementById('calculatorPrice').value = defaults[crop].price;
        calculateCropProfit();
    }
}

// Calculate Crop Profit
function calculateCropProfit() {
    const area = parseFloat(document.getElementById('calculatorArea').value) || 1;
    const yieldPerAcre = parseFloat(document.getElementById('calculatorYield').value) || 2000;
    const price = parseFloat(document.getElementById('calculatorPrice').value) || 25;
    
    // Calculations
    const totalYield = area * yieldPerAcre;
    const totalRevenue = totalYield * price;
    
    // Estimated costs (40% of revenue)
    const estimatedCost = totalRevenue * 0.4;
    const estimatedProfit = totalRevenue - estimatedCost;
    
    // Update results
    document.getElementById('totalYield').textContent = formatNumber(totalYield) + ' kg';
    document.getElementById('totalRevenue').textContent = '₹' + formatNumber(totalRevenue.toFixed(2));
    document.getElementById('estimatedProfit').textContent = '₹' + formatNumber(estimatedProfit.toFixed(2));
    
    // Show results with animation
    const results = document.getElementById('calculatorResults');
    results.style.display = 'block';
    results.style.animation = 'fadeIn 0.5s ease';
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('cropModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Print Crop Info
function printCropInfo() {
    window.print();
}

// Share Crop Info
function shareCropInfo(cropName) {
    if (navigator.share) {
        navigator.share({
            title: `${cropName} Information - SmartFarm`,
            text: `Check out detailed information about ${cropName} cultivation on SmartFarm`,
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        const text = `SmartFarm - ${cropName} Information\n\n` +
                     `Check detailed cultivation guide at: ${window.location.href}`;
        
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        });
    }
}

// Save Crop Info
function saveCropInfo(cropName) {
    const savedCrops = JSON.parse(localStorage.getItem('savedCrops') || '[]');
    
    if (!savedCrops.includes(cropName)) {
        savedCrops.push(cropName);
        localStorage.setItem('savedCrops', JSON.stringify(savedCrops));
        showNotification(`${cropName} saved to your collection!`, 'success');
    } else {
        showNotification(`${cropName} is already in your collection`, 'info');
    }
}

// Load Crop Data
function loadCropData() {
    // Check if user has saved crops
    const savedCrops = JSON.parse(localStorage.getItem('savedCrops') || '[]');
    if (savedCrops.length > 0) {
        console.log(`User has saved: ${savedCrops.join(', ')}`);
    }
}

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    const styles = `
        <style>
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid #4CAF50;
                max-width: 350px;
            }
            
            .notification-error {
                border-left-color: #f44336;
            }
            
            .notification-info {
                border-left-color: #2196f3;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .notification-content i {
                color: #4CAF50;
                font-size: 1.2rem;
            }
            
            .notification-error .notification-content i {
                color: #f44336;
            }
            
            .notification-info .notification-content i {
                color: #2196f3;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 5px;
                font-size: 1rem;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        </style>
    `;
    
    // Add to document
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.modal-content') && document.querySelector('.modal.active')) {
        closeModal();
    }
});