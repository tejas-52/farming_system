// Weather Page JavaScript

// OpenWeatherMap API Configuration
const WEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your API key
let currentLat = 19.0760; // Default: Mumbai
let currentLon = 72.8777;
let currentCity = 'Mumbai, IN';
let weatherChart = null;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date and time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    // Get user's location
    getLocation();
    
    // Initialize weather history chart
    initWeatherChart();
    
    // Load initial weather data
    loadWeatherData();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize chatbot with weather context
    initWeatherChatbot();
});

// Initialize Event Listeners
function initEventListeners() {
    // Search location on enter key
    const searchInput = document.getElementById('locationSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
    }
    
    // Subscribe form
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            subscribeToAlerts();
        });
    }
}

// Get User's Location
function getLocation() {
    if (navigator.geolocation) {
        showNotification('Getting your location...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                showNotification('Location detected! Loading weather...', 'success');
                loadWeatherData();
            },
            function(error) {
                console.error('Geolocation error:', error);
                showNotification('Using default location (Mumbai). Please enable location services for accurate weather.', 'warning');
                loadWeatherData();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showNotification('Geolocation not supported. Using default location.', 'warning');
        loadWeatherData();
    }
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    
    // Update time
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    // Update date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Update last updated time
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        const minutesAgo = 1; // Simulate 1 minute ago
        lastUpdated.textContent = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
    }
}

// Search Location
function searchLocation() {
    const searchInput = document.getElementById('locationSearch');
    const cityName = searchInput.value.trim();
    
    if (!cityName) {
        showNotification('Please enter a city name', 'warning');
        return;
    }
    
    showNotification(`Searching for ${cityName}...`, 'info');
    
    // Use OpenWeatherMap Geocoding API
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${WEATHER_API_KEY}`;
    
    fetch(geocodeUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                currentLat = data[0].lat;
                currentLon = data[0].lon;
                currentCity = `${data[0].name}, ${data[0].country}`;
                loadWeatherData();
                searchInput.value = '';
                showNotification(`Weather for ${currentCity}`, 'success');
            } else {
                throw new Error('City not found');
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            showNotification('City not found. Please try another location.', 'error');
        });
}

// Load Weather Data
async function loadWeatherData() {
    showLoading(true);
    
    try {
        // Fetch current weather
        const currentWeather = await fetchCurrentWeather();
        updateCurrentWeather(currentWeather);
        
        // Fetch hourly forecast
        const hourlyForecast = await fetchHourlyForecast();
        updateHourlyForecast(hourlyForecast);
        
        // Fetch daily forecast
        const dailyForecast = await fetchDailyForecast();
        updateDailyForecast(dailyForecast);
        
        // Generate farming recommendations
        generateFarmingRecommendations(currentWeather);
        
        // Update weather history
        loadWeatherHistory();
        
        // Show success message
        setTimeout(() => {
            showNotification('Weather data updated successfully!', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Weather data error:', error);
        showNotification('Failed to load weather data. Using sample data.', 'error');
        loadSampleData();
    } finally {
        showLoading(false);
    }
}

// Fetch Current Weather
async function fetchCurrentWeather() {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLat}&lon=${currentLon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Weather API error');
    }
    
    return await response.json();
}

// Update Current Weather Display
function updateCurrentWeather(data) {
    // Update location
    document.getElementById('currentLocation').textContent = data.name + ', ' + data.sys.country;
    currentCity = data.name + ', ' + data.sys.country;
    
    // Update temperature
    const temp = Math.round(data.main.temp);
    document.getElementById('currentTemp').textContent = temp;
    
    // Update high/low temperatures
    document.getElementById('highTemp').textContent = Math.round(data.main.temp_max);
    document.getElementById('lowTemp').textContent = Math.round(data.main.temp_min);
    
    // Update weather condition
    const condition = data.weather[0].description;
    document.getElementById('weatherCondition').textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
    
    // Update weather details
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°C';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
    document.getElementById('windDirection').textContent = getWindDirection(data.wind.deg);
    document.getElementById('cloudCover').textContent = data.clouds.all + '%';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    
    // Calculate UV index (simulated - would need separate API call)
    const uvIndex = calculateUVIndex(data);
    document.getElementById('uvIndex').textContent = uvIndex;
    
    // Calculate visibility
    const visibility = (data.visibility / 1000).toFixed(1);
    document.getElementById('visibility').textContent = visibility + ' km';
    
    // Update weather icon
    updateWeatherIcon(data.weather[0].id, data.weather[0].icon);
}

// Get Wind Direction
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
}

// Calculate UV Index
function calculateUVIndex(weatherData) {
    // This is a simplified calculation
    // In a real app, you would use a UV index API
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    
    let baseUV = 3; // Base UV index
    
    // Adjust based on time of day
    if (hour >= 10 && hour <= 14) {
        baseUV += 3; // Higher at midday
    } else if (hour >= 7 && hour <= 9 || hour >= 15 && hour <= 17) {
        baseUV += 1;
    }
    
    // Adjust based on season
    if (month >= 4 && month <= 9) {
        baseUV += 2; // Higher in summer
    }
    
    // Adjust based on cloud cover
    const cloudFactor = weatherData.clouds.all / 100;
    baseUV *= (1 - cloudFactor * 0.7); // Reduce by up to 70% with full cloud cover
    
    return Math.round(baseUV);
}

// Update Weather Icon
function updateWeatherIcon(weatherCode, iconCode) {
    const iconElement = document.getElementById('currentWeatherIcon');
    const iconClass = getWeatherIconClass(weatherCode, iconCode);
    iconElement.className = iconClass;
}

// Get Weather Icon Class
function getWeatherIconClass(weatherCode, iconCode) {
    const iconMap = {
        // Thunderstorm
        '200': 'wi wi-thunderstorm',
        '201': 'wi wi-thunderstorm',
        '202': 'wi wi-thunderstorm',
        '210': 'wi wi-lightning',
        '211': 'wi wi-lightning',
        '212': 'wi wi-lightning',
        '221': 'wi wi-lightning',
        '230': 'wi wi-thunderstorm',
        '231': 'wi wi-thunderstorm',
        '232': 'wi wi-thunderstorm',
        
        // Drizzle
        '300': 'wi wi-sprinkle',
        '301': 'wi wi-sprinkle',
        '302': 'wi wi-sprinkle',
        '310': 'wi wi-sprinkle',
        '311': 'wi wi-sprinkle',
        '312': 'wi wi-sprinkle',
        '313': 'wi wi-sprinkle',
        '314': 'wi wi-sprinkle',
        '321': 'wi wi-sprinkle',
        
        // Rain
        '500': 'wi wi-rain',
        '501': 'wi wi-rain',
        '502': 'wi wi-rain',
        '503': 'wi wi-rain',
        '504': 'wi wi-rain',
        '511': 'wi wi-rain-mix',
        '520': 'wi wi-showers',
        '521': 'wi wi-showers',
        '522': 'wi wi-showers',
        '531': 'wi wi-showers',
        
        // Snow
        '600': 'wi wi-snow',
        '601': 'wi wi-snow',
        '602': 'wi wi-snow',
        '611': 'wi wi-sleet',
        '612': 'wi wi-sleet',
        '615': 'wi wi-rain-mix',
        '616': 'wi wi-rain-mix',
        '620': 'wi wi-rain-mix',
        '621': 'wi wi-rain-mix',
        '622': 'wi wi-rain-mix',
        
        // Atmosphere
        '701': 'wi wi-fog',
        '711': 'wi wi-smoke',
        '721': 'wi wi-day-haze',
        '731': 'wi wi-dust',
        '741': 'wi wi-fog',
        '751': 'wi wi-sandstorm',
        '761': 'wi wi-dust',
        '762': 'wi wi-volcano',
        '771': 'wi wi-strong-wind',
        '781': 'wi wi-tornado',
        
        // Clear
        '800': iconCode.includes('d') ? 'wi wi-day-sunny' : 'wi wi-night-clear',
        
        // Clouds
        '801': iconCode.includes('d') ? 'wi wi-day-cloudy' : 'wi wi-night-alt-cloudy',
        '802': 'wi wi-cloud',
        '803': 'wi wi-cloudy',
        '804': 'wi wi-cloudy'
    };
    
    return iconMap[weatherCode.toString()] || 'wi wi-day-sunny';
}

// Fetch Hourly Forecast
async function fetchHourlyForecast() {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLat}&lon=${currentLon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Forecast API error');
    }
    
    const data = await response.json();
    return data.list.slice(0, 8); // Get next 8 periods (24 hours)
}

// Update Hourly Forecast
function updateHourlyForecast(hourlyData) {
    const hourlyScroll = document.getElementById('hourlyScroll');
    hourlyScroll.innerHTML = '';
    
    hourlyData.forEach((period, index) => {
        const time = new Date(period.dt * 1000);
        const hour = time.getHours();
        const temp = Math.round(period.main.temp);
        const pop = Math.round(period.pop * 100); // Probability of precipitation
        const weatherCode = period.weather[0].id;
        
        const hourCard = document.createElement('div');
        hourCard.className = 'hourly-card';
        
        // Determine time display
        let timeDisplay;
        if (index === 0) {
            timeDisplay = 'Now';
        } else if (hour === 0) {
            timeDisplay = '12 AM';
        } else if (hour < 12) {
            timeDisplay = `${hour} AM`;
        } else if (hour === 12) {
            timeDisplay = '12 PM';
        } else {
            timeDisplay = `${hour - 12} PM`;
        }
        
        // Get weather icon class
        const iconClass = getWeatherIconClass(weatherCode, period.weather[0].icon);
        
        hourCard.innerHTML = `
            <div class="hourly-time">${timeDisplay}</div>
            <div class="hourly-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="hourly-temp">${temp}°</div>
            <div class="hourly-precip">
                <i class="fas fa-tint"></i> ${pop}%
            </div>
        `;
        
        hourlyScroll.appendChild(hourCard);
    });
}

// Scroll Hourly Forecast
function scrollHourly(direction) {
    const hourlyScroll = document.getElementById('hourlyScroll');
    hourlyScroll.scrollBy({
        left: direction,
        behavior: 'smooth'
    });
}

// Fetch Daily Forecast
async function fetchDailyForecast() {
    // Note: OpenWeatherMap One Call API would be better for daily forecast
    // Using 5-day forecast and grouping by day
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLat}&lon=${currentLon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Forecast API error');
    }
    
    const data = await response.json();
    
    // Group by day and get daily summaries
    const dailyForecast = [];
    const days = {};
    
    data.list.forEach(period => {
        const date = new Date(period.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!days[dayKey]) {
            days[dayKey] = {
                temps: [],
                conditions: [],
                pop: [],
                date: date
            };
        }
        
        days[dayKey].temps.push(period.main.temp);
        days[dayKey].conditions.push(period.weather[0].id);
        days[dayKey].pop.push(period.pop);
    });
    
    // Convert to array and limit to 5 days
    let dayCount = 0;
    for (const dayKey in days) {
        if (dayCount >= 5) break;
        
        const dayData = days[dayKey];
        const avgTemp = dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length;
        const maxTemp = Math.max(...dayData.temps);
        const minTemp = Math.min(...dayData.temps);
        const avgPop = dayData.pop.reduce((a, b) => a + b, 0) / dayData.pop.length;
        
        // Most frequent condition
        const conditionCounts = {};
        dayData.conditions.forEach(code => {
            conditionCounts[code] = (conditionCounts[code] || 0) + 1;
        });
        const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
            conditionCounts[a] > conditionCounts[b] ? a : b
        );
        
        dailyForecast.push({
            date: dayData.date,
            avgTemp: Math.round(avgTemp),
            maxTemp: Math.round(maxTemp),
            minTemp: Math.round(minTemp),
            pop: Math.round(avgPop * 100),
            condition: parseInt(mostCommonCondition)
        });
        
        dayCount++;
    }
    
    return dailyForecast;
}

// Update Daily Forecast
function updateDailyForecast(dailyData) {
    const dailyForecastGrid = document.getElementById('dailyForecast');
    dailyForecastGrid.innerHTML = '';
    
    const days = ['Today', 'Tomorrow', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    dailyData.forEach((day, index) => {
        const date = day.date;
        const dayName = index === 0 ? 'Today' : 
                       index === 1 ? 'Tomorrow' : 
                       days[date.getDay()];
        
        const iconClass = getWeatherIconClass(day.condition, '01d'); // Using day icon
        
        const dayCard = document.createElement('div');
        dayCard.className = 'daily-card';
        
        dayCard.innerHTML = `
            <div class="daily-day">${dayName}</div>
            <div class="daily-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="daily-temp">
                <span class="high">${day.maxTemp}°</span>
                <span class="low">${day.minTemp}°</span>
            </div>
            <div class="daily-condition">${getWeatherDescription(day.condition)}</div>
            <div class="daily-precip">
                <i class="fas fa-tint"></i> ${day.pop}%
            </div>
        `;
        
        dailyForecastGrid.appendChild(dayCard);
    });
}

// Get Weather Description
function getWeatherDescription(weatherCode) {
    const descriptions = {
        200: 'Thunderstorm',
        300: 'Light Drizzle',
        500: 'Light Rain',
        501: 'Moderate Rain',
        502: 'Heavy Rain',
        600: 'Light Snow',
        601: 'Snow',
        602: 'Heavy Snow',
        700: 'Mist',
        800: 'Clear',
        801: 'Partly Cloudy',
        802: 'Cloudy',
        803: 'Mostly Cloudy',
        804: 'Overcast'
    };
    
    // Find the closest match
    const codeKeys = Object.keys(descriptions).map(Number).sort((a, b) => a - b);
    let closestCode = 800; // Default to clear
    
    for (const code of codeKeys) {
        if (weatherCode >= code) {
            closestCode = code;
        } else {
            break;
        }
    }
    
    return descriptions[closestCode] || 'Clear';
}

// Generate Farming Recommendations
function generateFarmingRecommendations(weatherData) {
    const recommendationsGrid = document.getElementById('farmingRecommendations');
    const recommendations = [];
    
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const condition = weatherData.weather[0].main.toLowerCase();
    
    // Irrigation advice
    if (condition.includes('rain') || humidity > 70) {
        recommendations.push({
            icon: 'fas fa-tint',
            title: 'Irrigation Advice',
            content: 'Rain expected. Delay irrigation to avoid overwatering.',
            time: 'Monitor rainfall'
        });
    } else if (temp > 30) {
        recommendations.push({
            icon: 'fas fa-tint',
            title: 'Irrigation Advice',
            content: 'Hot day ahead. Water crops early morning to reduce evaporation.',
            time: 'Today 6:00 AM - 8:00 AM'
        });
    } else {
        recommendations.push({
            icon: 'fas fa-tint',
            title: 'Irrigation Advice',
            content: 'Normal watering schedule recommended. Water in early morning.',
            time: 'Today 6:00 AM - 8:00 AM'
        });
    }
    
    // Spraying schedule
    if (windSpeed > 5) {
        recommendations.push({
            icon: 'fas fa-spray-can',
            title: 'Spraying Schedule',
            content: 'Windy conditions. Delay pesticide application to avoid drift.',
            time: 'Wait for calmer conditions'
        });
    } else {
        recommendations.push({
            icon: 'fas fa-spray-can',
            title: 'Spraying Schedule',
            content: 'Good conditions for spraying. Apply in early morning or late evening.',
            time: 'Today 5:00 PM - 7:00 PM'
        });
    }
    
    // Field activities
    if (condition.includes('rain')) {
        recommendations.push({
            icon: 'fas fa-tractor',
            title: 'Field Activities',
            content: 'Wet conditions. Avoid field work to prevent soil compaction.',
            time: 'Delay field work'
        });
    } else if (temp > 35) {
        recommendations.push({
            icon: 'fas fa-tractor',
            title: 'Field Activities',
            content: 'Extreme heat. Limit outdoor work during peak hours.',
            time: 'Work in early morning or evening'
        });
    } else {
        recommendations.push({
            icon: 'fas fa-tractor',
            title: 'Field Activities',
            content: 'Good day for field preparation and maintenance activities.',
            time: 'All Day'
        });
    }
    
    // Crop protection
    if (humidity > 80) {
        recommendations.push({
            icon: 'fas fa-leaf',
            title: 'Crop Protection',
            content: 'High humidity. Monitor for fungal diseases. Consider fungicide application.',
            time: 'Monitor Closely'
        });
    } else if (temp < 10) {
        recommendations.push({
            icon: 'fas fa-leaf',
            title: 'Crop Protection',
            content: 'Cold temperatures. Protect sensitive crops from frost damage.',
            time: 'Tonight - Early Morning'
        });
    } else {
        recommendations.push({
            icon: 'fas fa-leaf',
            title: 'Crop Protection',
            content: 'Normal conditions. Regular monitoring recommended.',
            time: 'Regular Monitoring'
        });
    }
    
    // Update recommendations grid
    recommendationsGrid.innerHTML = '';
    recommendations.forEach(rec => {
        const recCard = document.createElement('div');
        recCard.className = 'recommendation-card';
        
        recCard.innerHTML = `
            <div class="recommendation-icon">
                <i class="${rec.icon}"></i>
            </div>
            <div class="recommendation-content">
                <h3>${rec.title}</h3>
                <p>${rec.content}</p>
                <span class="recommendation-time">${rec.time}</span>
            </div>
        `;
        
        recommendationsGrid.appendChild(recCard);
    });
}

// Initialize Weather Chart
function initWeatherChart() {
    const ctx = document.getElementById('weatherHistoryChart').getContext('2d');
    
    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Load Weather History
function loadWeatherHistory() {
    const period = document.getElementById('historyPeriod').value;
    const metric = document.getElementById('historyMetric').value;
    
    // In a real app, this would fetch historical data from an API
    // For now, we'll generate sample data
    const days = parseInt(period);
    const labels = [];
    const data = [];
    
    // Generate sample data
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        // Generate data based on metric
        let value;
        switch(metric) {
            case 'temperature':
                value = 20 + Math.random() * 10; // 20-30°C
                break;
            case 'rainfall':
                value = Math.random() * 20; // 0-20mm
                break;
            case 'humidity':
                value = 50 + Math.random() * 30; // 50-80%
                break;
            case 'wind':
                value = 5 + Math.random() * 15; // 5-20 km/h
                break;
        }
        data.push(Math.round(value * 10) / 10);
    }
    
    // Update chart
    weatherChart.data.labels = labels;
    weatherChart.data.datasets[0].data = data;
    weatherChart.data.datasets[0].label = getMetricLabel(metric);
    weatherChart.update();
    
    // Update stats
    updateWeatherStats(data, metric);
}

// Get Metric Label
function getMetricLabel(metric) {
    const labels = {
        'temperature': 'Temperature (°C)',
        'rainfall': 'Rainfall (mm)',
        'humidity': 'Humidity (%)',
        'wind': 'Wind Speed (km/h)'
    };
    return labels[metric] || metric;
}

// Update Weather Stats
function updateWeatherStats(data, metric) {
    const sum = data.reduce((a, b) => a + b, 0);
    const avg = sum / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    
    switch(metric) {
        case 'temperature':
            document.getElementById('avgTemp').textContent = Math.round(avg) + '°C';
            document.getElementById('totalRainfall').textContent = '-- mm';
            document.getElementById('sunnyDays').textContent = Math.round(data.filter(t => t > 25).length);
            document.getElementById('maxWind').textContent = '-- km/h';
            break;
            
        case 'rainfall':
            document.getElementById('avgTemp').textContent = '--°C';
            document.getElementById('totalRainfall').textContent = Math.round(sum) + ' mm';
            document.getElementById('sunnyDays').textContent = Math.round(data.filter(r => r < 1).length);
            document.getElementById('maxWind').textContent = '-- km/h';
            break;
            
        case 'humidity':
            document.getElementById('avgTemp').textContent = '--°C';
            document.getElementById('totalRainfall').textContent = '-- mm';
            document.getElementById('sunnyDays').textContent = Math.round(data.filter(h => h < 60).length);
            document.getElementById('maxWind').textContent = '-- km/h';
            break;
            
        case 'wind':
            document.getElementById('avgTemp').textContent = '--°C';
            document.getElementById('totalRainfall').textContent = '-- mm';
            document.getElementById('sunnyDays').textContent = '--';
            document.getElementById('maxWind').textContent = Math.round(max) + ' km/h';
            break;
    }
}

// Update History Chart
function updateHistoryChart() {
    loadWeatherHistory();
}

// Show Map Type
function showMapType(type) {
    // Update active button
    document.querySelectorAll('.map-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update map display (in a real app, this would change the map layer)
    const mapPlaceholder = document.getElementById('weatherMap');
    const loading = mapPlaceholder.querySelector('.map-loading');
    
    loading.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading ${type} map...</p>
    `;
    
    // Simulate map loading
    setTimeout(() => {
        loading.style.display = 'none';
        
        // Update legend based on map type
        const legend = mapPlaceholder.querySelector('.legend-items');
        if (type === 'temperature') {
            legend.innerHTML = `
                <div class="legend-item">
                    <span class="legend-color" style="background: #0000ff;"></span>
                    <span>Cool (< 15°C)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #00ff00;"></span>
                    <span>Moderate (15-25°C)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ff0000;"></span>
                    <span>Warm (> 25°C)</span>
                </div>
            `;
        } else if (type === 'rainfall') {
            legend.innerHTML = `
                <div class="legend-item">
                    <span class="legend-color" style="background: #00ff00;"></span>
                    <span>Light Rain</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #0000ff;"></span>
                    <span>Moderate Rain</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background: #ff0000;"></span>
                    <span>Heavy Rain</span>
                </div>
            `;
        }
    }, 1000);
}

// Zoom Map
function zoomMap(direction) {
    const zoomLevel = document.querySelector('.zoom-level');
    let currentZoom = parseInt(zoomLevel.textContent);
    
    if (direction > 0 && currentZoom < 200) {
        currentZoom += 25;
    } else if (direction < 0 && currentZoom > 50) {
        currentZoom -= 25;
    }
    
    zoomLevel.textContent = currentZoom + '%';
}

// Subscribe to Alerts
function subscribeToAlerts() {
    const form = document.getElementById('subscribeForm');
    const formData = new FormData(form);
    
    // Get form values
    const email = form.querySelector('input[type="email"]').value;
    const phone = form.querySelector('input[type="tel"]').value;
    const alertType = form.querySelector('select').value;
    const frequency = form.querySelectorAll('select')[1].value;
    const smsAlerts = form.querySelector('#smsAlerts').checked;
    const emailAlerts = form.querySelector('#emailAlerts').checked;
    
    // Validate
    if (!email) {
        showNotification('Please enter your email address', 'warning');
        return;
    }
    
    if (!alertType || !frequency) {
        showNotification('Please select alert type and frequency', 'warning');
        return;
    }
    
    if (!smsAlerts && !emailAlerts) {
        showNotification('Please select at least one alert method', 'warning');
        return;
    }
    
    // Save to localStorage (in a real app, this would go to a backend)
    const subscriptions = JSON.parse(localStorage.getItem('weatherSubscriptions') || '[]');
    const newSubscription = {
        email: email,
        phone: phone || null,
        alertType: alertType,
        frequency: frequency,
        smsAlerts: smsAlerts,
        emailAlerts: emailAlerts,
        location: currentCity,
        subscribedAt: new Date().toISOString()
    };
    
    subscriptions.push(newSubscription);
    localStorage.setItem('weatherSubscriptions', JSON.stringify(subscriptions));
    
    // Show success message
    showNotification('Successfully subscribed to weather alerts!', 'success');
    
    // Reset form
    form.reset();
    form.querySelector('#smsAlerts').checked = true;
    form.querySelector('#emailAlerts').checked = true;
}

// Initialize Weather Chatbot
function initWeatherChatbot() {
    // Override chatbot responses for weather context
    window.getBotResponse = function(message) {
        const msg = message.toLowerCase();
        
        // Weather-related responses
        if (msg.includes('weather') || msg.includes('forecast') || msg.includes('temperature')) {
            const responses = [
                `The current temperature in ${currentCity} is ${document.getElementById('currentTemp').textContent}°C with ${document.getElementById('weatherCondition').textContent.toLowerCase()}.`,
                `Today's forecast shows a high of ${document.getElementById('highTemp').textContent}°C and low of ${document.getElementById('lowTemp').textContent}°C.`,
                `Current conditions: ${document.getElementById('weatherCondition').textContent}, Humidity: ${document.getElementById('humidity').textContent}, Wind: ${document.getElementById('windSpeed').textContent}.`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        if (msg.includes('rain') || msg.includes('precipitation')) {
            return "Check the hourly forecast section for precipitation chances. You can also view rainfall predictions in the 5-day forecast.";
        }
        
        if (msg.includes('farm') || msg.includes('crop') || msg.includes('irrigation')) {
            return "Based on current weather, I recommend checking the Farming Recommendations section for weather-based farming advice.";
        }
        
        if (msg.includes('alert') || msg.includes('warning')) {
            return "Weather alerts are shown in the Alerts section. You can also subscribe to receive alerts via email or SMS.";
        }
        
        // Default responses
        const defaultResponses = [
            "I'm your weather assistant! You can ask me about current conditions, forecasts, or farming recommendations.",
            "How can I help you with weather information today?",
            "Check the weather dashboard for detailed forecasts and farming advice."
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };
}

// Show Loading State
function showLoading(show) {
    const loadingElements = document.querySelectorAll('.weather-card-loading');
    if (show) {
        document.querySelectorAll('.current-weather-card, .hourly-card, .daily-card').forEach(el => {
            el.classList.add('weather-card-loading');
        });
    } else {
        document.querySelectorAll('.weather-card-loading').forEach(el => {
            el.classList.remove('weather-card-loading');
        });
    }
}

// Load Sample Data (fallback)
function loadSampleData() {
    // Current weather sample
    const sampleCurrentWeather = {
        name: 'Mumbai',
        sys: { country: 'IN' },
        main: {
            temp: 28,
            temp_max: 32,
            temp_min: 26,
            feels_like: 30,
            humidity: 65,
            pressure: 1013
        },
        weather: [{ id: 800, description: 'clear sky', icon: '01d' }],
        wind: { speed: 3.3, deg: 180 },
        clouds: { all: 20 },
        visibility: 10000
    };
    
    updateCurrentWeather(sampleCurrentWeather);
    
    // Generate sample hourly data
    const sampleHourly = [];
    for (let i = 0; i < 8; i++) {
        sampleHourly.push({
            dt: (Date.now() / 1000) + i * 3600,
            main: { temp: 28 + Math.random() * 4 - 2, pop: Math.random() * 0.3 },
            weather: [{ id: 800, icon: '01d' }]
        });
    }
    updateHourlyForecast(sampleHourly);
    
    // Generate sample daily data
    const sampleDaily = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        sampleDaily.push({
            date: date,
            maxTemp: 30 + Math.random() * 4 - 2,
            minTemp: 26 + Math.random() * 4 - 2,
            pop: Math.round(Math.random() * 30),
            condition: 800
        });
    }
    updateDailyForecast(sampleDaily);
    
    // Generate sample recommendations
    generateFarmingRecommendations(sampleCurrentWeather);
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.weather-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `weather-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#weather-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'weather-notification-styles';
        styles.textContent = `
            .weather-notification {
                position: fixed;
                top: 100px;
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
                border-left: 4px solid #2196f3;
                max-width: 350px;
            }
            
            .notification-success {
                border-left-color: #4CAF50;
            }
            
            .notification-error {
                border-left-color: #f44336;
            }
            
            .notification-warning {
                border-left-color: #ff9800;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .notification-content i {
                color: #2196f3;
                font-size: 1.2rem;
            }
            
            .notification-success .notification-content i {
                color: #4CAF50;
            }
            
            .notification-error .notification-content i {
                color: #f44336;
            }
            
            .notification-warning .notification-content i {
                color: #ff9800;
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
        `;
        document.head.appendChild(styles);
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Export weather data
function exportWeatherData() {
    const data = {
        location: currentCity,
        current: {
            temp: document.getElementById('currentTemp').textContent,
            condition: document.getElementById('weatherCondition').textContent,
            humidity: document.getElementById('humidity').textContent,
            wind: document.getElementById('windSpeed').textContent
        },
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Weather data exported successfully!', 'success');
}