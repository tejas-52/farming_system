// soil-analysis.js - Soil Analysis JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initSoilAnalysis();
});

function initSoilAnalysis() {
    // Initialize range sliders
    initRangeSliders();
    
    // Initialize charts
    initCharts();
    
    // Initialize soil map
    initSoilMap();
    
    // Load saved soil data
    loadSavedSoilData();
}

// Tab Navigation
function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.analysis-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.analysis-tab').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Range Sliders
function initRangeSliders() {
    // pH Level Slider
    const phSlider = document.getElementById('phLevel');
    const phDisplay = document.getElementById('phDisplay');
    const phValue = document.getElementById('phValue');
    
    phSlider.addEventListener('input', function() {
        const value = this.value;
        phDisplay.textContent = value;
        phValue.textContent = value;
        
        // Update color based on pH value
        if (value < 5.5) {
            phDisplay.style.color = '#f44336'; // Acidic - Red
        } else if (value > 7.5) {
            phDisplay.style.color = '#2196F3'; // Alkaline - Blue
        } else {
            phDisplay.style.color = '#4CAF50'; // Neutral - Green
        }
    });
    
    // Nutrient Range Sliders
    const nutrientSliders = [
        { slider: 'nitrogenRange', input: 'nitrogen' },
        { slider: 'phosphorusRange', input: 'phosphorus' },
        { slider: 'potassiumRange', input: 'potassium' },
        { slider: 'organicCarbonRange', input: 'organicCarbon' }
    ];
    
    nutrientSliders.forEach(item => {
        const slider = document.getElementById(item.slider);
        const input = document.getElementById(item.input);
        
        if (slider && input) {
            // Update input when slider changes
            slider.addEventListener('input', function() {
                input.value = this.value;
            });
            
            // Update slider when input changes
            input.addEventListener('input', function() {
                slider.value = this.value;
            });
        }
    });
}

// Charts
function initCharts() {
    // Macronutrient Chart
    const macronutrientCtx = document.getElementById('macronutrientChart');
    if (macronutrientCtx) {
        new Chart(macronutrientCtx, {
            type: 'bar',
            data: {
                labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
                datasets: [{
                    label: 'Current Level (kg/ha)',
                    data: [150, 25, 120],
                    backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
                    borderColor: ['#388E3C', '#1976D2', '#F57C00'],
                    borderWidth: 1
                }, {
                    label: 'Recommended',
                    data: [180, 40, 150],
                    backgroundColor: ['#A5D6A7', '#90CAF9', '#FFCC80'],
                    borderColor: ['#81C784', '#64B5F6', '#FFB74D'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'kg/ha'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // pH Chart
    const phCtx = document.getElementById('phChart');
    if (phCtx) {
        new Chart(phCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Soil pH Level',
                    data: [6.2, 6.3, 6.5, 6.4, 6.6, 6.5],
                    borderColor: '#5d4037',
                    backgroundColor: 'rgba(93, 64, 55, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 5,
                        max: 8,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Micronutrient Chart
    const micronutrientCtx = document.getElementById('micronutrientChart');
    if (micronutrientCtx) {
        new Chart(micronutrientCtx, {
            type: 'radar',
            data: {
                labels: ['Zinc', 'Iron', 'Copper', 'Manganese', 'Boron'],
                datasets: [{
                    label: 'Current Level',
                    data: [0.8, 4.5, 0.6, 2.1, 0.5],
                    backgroundColor: 'rgba(93, 64, 55, 0.2)',
                    borderColor: '#5d4037',
                    borderWidth: 2,
                    pointBackgroundColor: '#5d4037'
                }, {
                    label: 'Optimal Range',
                    data: [1.0, 5.0, 0.8, 2.5, 0.6],
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderColor: '#4CAF50',
                    borderWidth: 1,
                    pointBackgroundColor: '#4CAF50',
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 6
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
}

// Soil Map
function initSoilMap() {
    const soilMap = document.getElementById('soilMap');
    if (!soilMap) return;
    
    // Initialize map centered on India
    const map = L.map('soilMap').setView([20.5937, 78.9629], 5);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Sample soil data points
    const soilData = [
        { lat: 18.5204, lng: 73.8567, type: 'clay', name: 'Pune Region' },
        { lat: 19.0760, lng: 72.8777, type: 'loamy', name: 'Mumbai Region' },
        { lat: 12.9716, lng: 77.5946, type: 'sandy', name: 'Bangalore Region' },
        { lat: 28.7041, lng: 77.1025, type: 'clay', name: 'Delhi Region' },
        { lat: 22.5726, lng: 88.3639, type: 'alluvial', name: 'Kolkata Region' }
    ];
    
    // Color coding for soil types
    const soilColors = {
        'clay': '#795548',
        'loamy': '#8D6E63',
        'sandy': '#D7CCC8',
        'alluvial': '#5D4037',
        'black': '#212121'
    };
    
    // Add markers for each soil point
    soilData.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
            color: soilColors[point.type] || '#000000',
            fillColor: soilColors[point.type] || '#000000',
            fillOpacity: 0.7,
            radius: 8
        }).addTo(map);
        
        marker.bindPopup(`
            <strong>${point.name}</strong><br>
            Soil Type: ${point.type.charAt(0).toUpperCase() + point.type.slice(1)}<br>
            Fertility: High<br>
            pH Range: 6.5-7.2
        `);
    });
    
    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        const soilTypes = Object.keys(soilColors);
        let labels = '<strong>Soil Types</strong><br>';
        
        soilTypes.forEach(type => {
            labels += `
                <div style="margin: 5px 0;">
                    <span style="display: inline-block; width: 12px; height: 12px; 
                          background-color: ${soilColors[type]}; margin-right: 5px;"></span>
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
            `;
        });
        
        div.innerHTML = labels;
        return div;
    };
    legend.addTo(map);
}

// Generate Soil Report
function generateSoilReport() {
    // Collect form data
    const soilData = {
        location: document.getElementById('soilLocation').value,
        soilType: document.getElementById('soilType').value,
        fieldArea: parseFloat(document.getElementById('fieldArea').value),
        phLevel: parseFloat(document.getElementById('phLevel').value),
        nitrogen: parseFloat(document.getElementById('nitrogen').value),
        phosphorus: parseFloat(document.getElementById('phosphorus').value),
        potassium: parseFloat(document.getElementById('potassium').value),
        organicCarbon: parseFloat(document.getElementById('organicCarbon').value),
        zinc: parseFloat(document.getElementById('zinc').value) || 0.8,
        iron: parseFloat(document.getElementById('iron').value) || 4.5,
        copper: parseFloat(document.getElementById('copper').value) || 0.6,
        manganese: parseFloat(document.getElementById('manganese').value) || 2.1,
        timestamp: new Date().toISOString()
    };
    
    // Validate form
    if (!soilData.location || !soilData.soilType || !soilData.fieldArea) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Calculate overall soil health score (1-10)
    let score = 7.5; // Base score
    
    // Adjust based on pH
    if (soilData.phLevel >= 6.0 && soilData.phLevel <= 7.5) {
        score += 1.0; // Optimal pH range
    } else if (soilData.phLevel >= 5.5 && soilData.phLevel <= 8.0) {
        score += 0.5; // Acceptable range
    } else {
        score -= 1.0; // Poor pH
    }
    
    // Adjust based on nutrients
    const nScore = soilData.nitrogen / 200; // Max 200 kg/ha considered optimal
    const pScore = soilData.phosphorus / 50; // Max 50 kg/ha
    const kScore = soilData.potassium / 200; // Max 200 kg/ha
    const ocScore = soilData.organicCarbon * 2; // Higher OC is better
    
    score += (nScore + pScore + kScore + ocScore) / 4;
    
    // Ensure score is between 1-10
    score = Math.max(1, Math.min(10, score));
    
    // Update report
    document.getElementById('overallScore').textContent = score.toFixed(1);
    
    // Update score description
    let description = '';
    if (score >= 9) {
        description = 'Excellent - Soil is in perfect condition for optimal crop growth';
    } else if (score >= 7) {
        description = 'Good - Soil needs minor improvements for optimal crop growth';
    } else if (score >= 5) {
        description = 'Fair - Soil needs moderate improvements for good crop growth';
    } else {
        description = 'Poor - Significant soil improvements needed before planting';
    }
    document.getElementById('scoreDescription').textContent = description;
    
    // Generate recommendations
    generateRecommendations(soilData, score);
    
    // Save to localStorage
    saveSoilData(soilData, score);
    
    // Switch to report tab
    showTab('view-report');
    
    // Show success notification
    showNotification('Soil analysis report generated successfully!', 'success');
}

function generateRecommendations(soilData, score) {
    const recommendationsList = document.getElementById('recommendationsList');
    let recommendations = [];
    
    // pH-based recommendations
    if (soilData.phLevel < 6.0) {
        recommendations.push({
            title: 'Increase Soil pH',
            description: `Apply agricultural lime at rate of ${Math.round((6.5 - soilData.phLevel) * 1000)} kg/ha to raise pH to optimal level (6.5-7.0).`
        });
    } else if (soilData.phLevel > 7.5) {
        recommendations.push({
            title: 'Decrease Soil pH',
            description: `Apply sulfur or gypsum at rate of ${Math.round((soilData.phLevel - 7.0) * 500)} kg/ha to lower pH to optimal level.`
        });
    }
    
    // Nutrient-based recommendations
    if (soilData.nitrogen < 150) {
        recommendations.push({
            title: 'Increase Nitrogen',
            description: `Apply urea at rate of ${Math.round((180 - soilData.nitrogen) / 0.46)} kg/ha to reach optimal nitrogen level.`
        });
    }
    
    if (soilData.phosphorus < 30) {
        recommendations.push({
            title: 'Increase Phosphorus',
            description: `Apply DAP at rate of ${Math.round((40 - soilData.phosphorus) / 0.46)} kg/ha to improve phosphorus availability.`
        });
    }
    
    if (soilData.potassium < 100) {
        recommendations.push({
            title: 'Increase Potassium',
            description: `Apply MOP at rate of ${Math.round((150 - soilData.potassium) / 0.6)} kg/ha for better crop health.`
        });
    }
    
    if (soilData.organicCarbon < 0.8) {
        recommendations.push({
            title: 'Improve Organic Matter',
            description: 'Add farmyard manure or compost at 5-10 tons/ha. Consider green manure crops like sunnhemp or daincha.'
        });
    }
    
    // Soil type specific recommendations
    if (soilData.soilType === 'clay') {
        recommendations.push({
            title: 'Improve Clay Soil',
            description: 'Add sand and organic matter to improve drainage. Use raised beds for better root growth.'
        });
    } else if (soilData.soilType === 'sandy') {
        recommendations.push({
            title: 'Improve Sandy Soil',
            description: 'Add clay and organic matter to improve water retention. Use drip irrigation for efficient water use.'
        });
    }
    
    // General recommendations
    if (score < 7) {
        recommendations.push({
            title: 'Soil Testing Frequency',
            description: 'Test soil every 6 months until health improves, then annually for maintenance.'
        });
    }
    
    // Display recommendations
    recommendationsList.innerHTML = '';
    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
        `;
        recommendationsList.appendChild(item);
    });
    
    // If no recommendations (perfect soil)
    if (recommendations.length === 0) {
        recommendationsList.innerHTML = `
            <div class="recommendation-item">
                <h4>Perfect Soil Condition</h4>
                <p>Your soil is in excellent condition! Maintain current practices and test every 12 months.</p>
            </div>
        `;
    }
}

// Fertilizer Calculator
function calculateFertilizer() {
    const cropType = document.getElementById('cropType').value;
    const targetYield = parseFloat(document.getElementById('targetYield').value);
    const currentN = parseFloat(document.getElementById('currentN').value);
    const currentP = parseFloat(document.getElementById('currentP').value);
    const currentK = parseFloat(document.getElementById('currentK').value);
    
    if (!cropType || !targetYield || isNaN(currentN) || isNaN(currentP) || isNaN(currentK)) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Crop-specific nutrient requirements (kg/ha per quintal yield)
    const cropRequirements = {
        rice: { n: 1.8, p: 0.8, k: 1.2 },
        wheat: { n: 2.0, p: 1.0, k: 1.5 },
        corn: { n: 1.5, p: 0.6, k: 1.0 },
        sugarcane: { n: 0.25, p: 0.1, k: 0.3 },
        cotton: { n: 1.2, p: 0.5, k: 1.0 },
        vegetables: { n: 1.0, p: 0.4, k: 0.8 },
        fruits: { n: 0.8, p: 0.3, k: 0.6 }
    };
    
    const requirements = cropRequirements[cropType] || cropRequirements.rice;
    
    // Calculate required nutrients
    const requiredN = targetYield * requirements.n;
    const requiredP = targetYield * requirements.p;
    const requiredK = targetYield * requirements.k;
    
    // Calculate additional nutrients needed
    const additionalN = Math.max(0, requiredN - currentN);
    const additionalP = Math.max(0, requiredP - currentP);
    const additionalK = Math.max(0, requiredK - currentK);
    
    // Calculate fertilizer amounts
    const ureaAmount = Math.round(additionalN / 0.46); // Urea contains 46% N
    const dapAmount = Math.round(additionalP / 0.46); // DAP contains 46% P
    const mopAmount = Math.round(additionalK / 0.60); // MOP contains 60% K
    
    // Calculate costs (approx prices per kg)
    const ureaPrice = 6.5; // ₹ per kg
    const dapPrice = 30; // ₹ per kg
    const mopPrice = 20; // ₹ per kg
    
    const totalCost = Math.round(ureaAmount * ureaPrice + dapAmount * dapPrice + mopAmount * mopPrice);
    
    // Determine application time based on crop
    let applicationTime = 'Before sowing';
    if (cropType === 'rice') applicationTime = 'Basal + Top dressing';
    if (cropType === 'wheat') applicationTime = 'Basal + 30 DAS';
    if (cropType === 'vegetables') applicationTime = 'Split applications';
    
    // Update results
    document.getElementById('ureaAmount').textContent = `${ureaAmount} kg/acre`;
    document.getElementById('dapAmount').textContent = `${dapAmount} kg/acre`;
    document.getElementById('mopAmount').textContent = `${mopAmount} kg/acre`;
    document.getElementById('totalCost').textContent = `₹${totalCost}`;
    document.getElementById('applicationTime').textContent = applicationTime;
    
    // Show results
    document.getElementById('fertilizerResults').classList.add('active');
    
    // Save calculation
    saveFertilizerCalculation({
        cropType,
        targetYield,
        requirements: { additionalN, additionalP, additionalK },
        fertilizers: { ureaAmount, dapAmount, mopAmount },
        totalCost,
        timestamp: new Date().toISOString()
    });
}

// Save Data Functions
function saveSoilData(soilData, score) {
    const savedTests = JSON.parse(localStorage.getItem('smartfarm_soil_tests') || '[]');
    savedTests.unshift({
        ...soilData,
        score: score,
        id: Date.now()
    });
    localStorage.setItem('smartfarm_soil_tests', JSON.stringify(savedTests));
}

function saveFertilizerCalculation(data) {
    const savedCalculations = JSON.parse(localStorage.getItem('smartfarm_fertilizer_calc') || '[]');
    savedCalculations.unshift({
        ...data,
        id: Date.now()
    });
    localStorage.setItem('smartfarm_fertilizer_calc', JSON.stringify(savedCalculations));
}

function loadSavedSoilData() {
    const savedTests = JSON.parse(localStorage.getItem('smartfarm_soil_tests') || '[]');
    if (savedTests.length > 0) {
        // You could populate a history section here
        console.log('Loaded soil tests:', savedTests.length);
    }
}

// Utility Functions
function printReport() {
    window.print();
}

function downloadReport() {
    showNotification('PDF download feature would be implemented in production', 'info');
}

function showNotification(message, type = 'success') {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Chatbot Integration
function toggleChatbot() {
    const chatbot = document.getElementById('chatbotContainer');
    chatbot.classList.toggle('active');
    
    if (chatbot.classList.contains('active')) {
        document.getElementById('chatInput').focus();
    }
}

function closeChatbot() {
    const chatbot = document.getElementById('chatbotContainer');
    chatbot.classList.remove('active');
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const chatBody = document.getElementById('chatbotBody');
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">Just now</div>
    `;
    chatBody.appendChild(userMessage);
    
    // Clear input
    input.value = '';
    
    // Generate bot response
    setTimeout(() => {
        const response = getSoilExpertResponse(message);
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-message bot';
        botMessage.innerHTML = `
            <div class="message-content">${response}</div>
            <div class="message-time">Just now</div>
        `;
        chatBody.appendChild(botMessage);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

function getSoilExpertResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('ph') || msg.includes('acid') || msg.includes('alkaline')) {
        return "Optimal soil pH is 6.5-7.0 for most crops. For acidic soil (<6.0), apply agricultural lime. For alkaline soil (>7.5), apply sulfur or gypsum.";
    }
    
    if (msg.includes('nitrogen') || msg.includes('n')) {
        return "Nitrogen promotes leaf growth. Sources: Urea (46% N), Ammonium Sulfate (21% N). Apply based on soil test results.";
    }
    
    if (msg.includes('phosphorus') || msg.includes('p')) {
        return "Phosphorus helps root development and flowering. Sources: DAP (18% N, 46% P), SSP (16% P). Best applied at planting.";
    }
    
    if (msg.includes('potassium') || msg.includes('k')) {
        return "Potassium improves disease resistance and fruit quality. Sources: MOP (60% K), SOP (50% K). Apply during active growth.";
    }
    
    if (msg.includes('organic') || msg.includes('compost')) {
        return "Organic matter improves soil structure and water retention. Add 5-10 tons of compost/ha annually. Green manure crops also help.";
    }
    
    if (msg.includes('test') || msg.includes('sample')) {
        return "Soil testing should be done every 6-12 months. Take samples from 15-20 locations per acre at 15cm depth. Use our soil test tool above!";
    }
    
    return "I can help with soil testing, pH management, nutrient recommendations, and fertilizer calculations. What specific aspect would you like to know about?";
}