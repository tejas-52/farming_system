// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Translate
    initGoogleTranslate();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize weather
    initWeather();
    
    // Initialize chatbot
    initChatbot();
    
    // Initialize language dropdown
    initLanguageDropdown();
    
    // Initialize user dropdown
    initUserDropdown();
    
    // Check authentication state
    checkAuthState();
    
    // Close dropdowns when clicking outside
    initClickOutside();
});

// Initialize Google Translate with hidden branding
function initGoogleTranslate() {
    // Wait for Google Translate to load
    setTimeout(() => {
        // Hide Google branding
        const googleFrame = document.querySelector('.goog-te-banner-frame');
        const googleGadget = document.querySelector('.goog-te-gadget');
        
        if (googleFrame) googleFrame.style.display = 'none';
        if (googleGadget) googleGadget.style.display = 'none';
        
        // Remove Google branding from page
        const skipTranslate = document.querySelector('.skiptranslate');
        if (skipTranslate) skipTranslate.style.display = 'none';
        
        // Set initial language from localStorage
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        changeLanguage(savedLang);
    }, 1000);
}

// Language Functions
function initLanguageDropdown() {
    const languageSelector = document.getElementById('languageSelector');
    const languageBtn = languageSelector?.querySelector('.language-btn');
    
    if (languageBtn) {
        languageBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleLanguageDropdown();
        });
    }
    
    // Set active language on load
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    updateLanguageDisplay(currentLang);
}

function toggleLanguageDropdown() {
    const languageSelector = document.getElementById('languageSelector');
    languageSelector.classList.toggle('active');
    
    // Close user dropdown if open
    const userProfile = document.getElementById('userProfile');
    if (userProfile?.classList.contains('active')) {
        userProfile.classList.remove('active');
    }
}

function changeLanguage(langCode) {
    // Save preference
    localStorage.setItem('preferredLanguage', langCode);
    
    // Update display
    updateLanguageDisplay(langCode);
    
    // Trigger Google Translate
    if (window.google && window.google.translate) {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        }
    }
    
    // Update mobile language buttons
    updateMobileLanguageButtons(langCode);
    
    // Close dropdown
    const languageSelector = document.getElementById('languageSelector');
    languageSelector.classList.remove('active');
    
    // Show success message
    showNotification(`Language changed to ${getLanguageName(langCode)}`);
}

function updateLanguageDisplay(langCode) {
    const languageText = document.getElementById('currentLanguage');
    if (languageText) {
        languageText.textContent = langCode.toUpperCase();
    }
    
    // Update checkmarks in dropdown
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        const checkIcon = option.querySelector('.fa-check');
        const optionLang = option.getAttribute('onclick').match(/changeLanguage\('([^']+)'\)/)[1];
        
        if (optionLang === langCode) {
            option.classList.add('active');
            if (checkIcon) checkIcon.style.display = 'inline-block';
        } else {
            option.classList.remove('active');
            if (checkIcon) checkIcon.style.display = 'none';
        }
    });
}

function updateMobileLanguageButtons(langCode) {
    const mobileLangBtns = document.querySelectorAll('.mobile-lang-btn');
    mobileLangBtns.forEach(btn => {
        const btnLang = btn.getAttribute('onclick').match(/changeLanguage\('([^']+)'\)/)[1];
        
        if (btnLang === langCode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function getLanguageName(langCode) {
    const languages = {
        'en': 'English',
        'mr': 'Marathi',
        'hi': 'Hindi',
        'ta': 'Tamil'
    };
    return languages[langCode] || 'English';
}

// Authentication Functions
function checkAuthState() {
    const token = localStorage.getItem('auth_token');
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (token) {
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'block';
            
            // Load user data
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            const userName = userProfile.querySelector('.user-name');
            if (userName && userData.full_name) {
                userName.textContent = userData.full_name;
            }
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
}

function initUserDropdown() {
    const userProfile = document.getElementById('userProfile');
    const userDropdown = userProfile?.querySelector('.user-dropdown');
    
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleUserDropdown();
        });
    }
}

function toggleUserDropdown() {
    const userProfile = document.getElementById('userProfile');
    userProfile.classList.toggle('active');
    
    // Close language dropdown if open
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector?.classList.contains('active')) {
        languageSelector.classList.remove('active');
    }
}

function logout() {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Show logout message
    showNotification('Successfully logged out');
    
    // Reload page to update UI
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Close dropdowns when clicking outside
function initClickOutside() {
    document.addEventListener('click', function(e) {
        const languageSelector = document.getElementById('languageSelector');
        const userProfile = document.getElementById('userProfile');
        
        // Close language dropdown
        if (languageSelector && !languageSelector.contains(e.target)) {
            languageSelector.classList.remove('active');
        }
        
        // Close user dropdown
        if (userProfile && !userProfile.contains(e.target)) {
            userProfile.classList.remove('active');
        }
    });
}

// Mobile Menu Functions
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMobileMenu);
    }
    
    // Close mobile menu on link click
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
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
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Weather Functions (from previous version)
async function initWeather() {
    try {
        if (navigator.geolocation) {
            const position = await getCurrentPosition();
            await fetchWeather(position.coords.latitude, position.coords.longitude);
        } else {
            await fetchWeather(19.0760, 72.8777); // Default to Mumbai
        }
    } catch (error) {
        console.log('Using default weather data');
        updateWeatherUI({
            name: 'Farm Location',
            main: { temp: 28, humidity: 65, feels_like: 30 },
            weather: [{ description: 'Partly Cloudy', main: 'Clouds' }],
            wind: { speed: 3.3 }
        });
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function fetchWeather(lat, lon) {
    const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeather API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');
        
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        throw error;
    }
}

function updateWeatherUI(data) {
    document.getElementById('locationText').textContent = data.name;
    document.getElementById('temperatureText').textContent = Math.round(data.main.temp);
    document.getElementById('conditionText').textContent = data.weather[0].description;
    document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('humidityText').textContent = `${data.main.humidity}%`;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    
    const rainChance = data.main.humidity > 80 ? 'High' : data.main.humidity > 60 ? 'Medium' : 'Low';
    document.getElementById('rainChance').textContent = rainChance;
    
    const iconMap = {
        'Clear': 'sun', 'Clouds': 'cloud', 'Rain': 'cloud-rain',
        'Drizzle': 'cloud-rain', 'Thunderstorm': 'bolt',
        'Snow': 'snowflake', 'Mist': 'smog', 'Fog': 'smog'
    };
    
    const weatherIcon = document.getElementById('weatherIcon');
    const condition = data.weather[0].main;
    weatherIcon.className = `fas fa-${iconMap[condition] || 'cloud'}`;
}

// Chatbot Functions (from previous version)
let chatHistory = [];

function initChatbot() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessage');
    
    if (chatInput && sendBtn) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
        chatHistory = JSON.parse(savedChats);
        displayChatHistory();
    }
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    chatInput.value = '';
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        const response = getBotResponse(message);
        addMessage(response, 'bot');
        
        chatHistory.push({
            user: message,
            bot: response,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        saveChatToServer(message, response);
    }, 1000);
}

function addMessage(content, sender) {
    const chatBody = document.getElementById('chatbotBody');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${time}</div>
    `;
    
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
    const chatBody = document.getElementById('chatbotBody');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.querySelector('.typing');
    if (typing) typing.remove();
}

function getBotResponse(message) {
    const msg = message.toLowerCase();
    
    const responses = {
        greeting: [
            "Hello! I'm your farming assistant. How can I help you today?",
            "Hi there! Ready to help with your farming questions.",
            "Welcome! I'm here to assist with all your farming needs."
        ],
        weather: [
            "The current weather is suitable for most crops. Check the weather section for detailed forecast.",
            "Based on the forecast, it's a good day for outdoor farming activities.",
            "Weather conditions look favorable. Remember to water crops in the morning."
        ],
        default: [
            "I understand you're asking about farming. Could you specify: crops, weather, soil, or market?",
            "That's an interesting question about farming. Let me connect you with more specific information.",
            "I'm learning more about farming every day. For now, I suggest checking our farming guides."
        ]
    };
    
    let category = 'default';
    if (msg.includes('hello') || msg.includes('hi')) category = 'greeting';
    else if (msg.includes('weather') || msg.includes('rain')) category = 'weather';
    
    const categoryResponses = responses[category];
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

function displayChatHistory() {
    const chatBody = document.getElementById('chatbotBody');
    chatBody.innerHTML = '';
    
    addMessage("Hello! I'm your farming assistant. How can I help you today with crops, weather, or farming advice?", 'bot');
    
    const recentChats = chatHistory.slice(-10);
    recentChats.forEach(chat => {
        addMessage(chat.user, 'user');
        addMessage(chat.bot, 'bot');
    });
}

// Chatbot UI Controls
function toggleChatbot() {
    const chatbot = document.getElementById('chatbotContainer');
    chatbot.classList.toggle('active');
    
    if (chatbot.classList.contains('active')) {
        document.getElementById('chatInput').focus();
    }
}

function openChatbot() {
    const chatbot = document.getElementById('chatbotContainer');
    chatbot.classList.add('active');
    document.getElementById('chatInput').focus();
}

function closeChatbot() {
    const chatbot = document.getElementById('chatbotContainer');
    chatbot.classList.remove('active');
}

// Add this CSS for notifications
const style = document.createElement('style');
style.textContent = `
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
    
    .notification-close {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
        font-size: 1rem;
    }
    
    .typing-dots {
        display: flex;
        gap: 4px;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #666;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out both;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
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
document.head.appendChild(style);


// Add this to your main script.js file
function fixTextContrast() {
    // Elements that commonly have contrast issues
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, td, th, label, input, textarea, select');
    
    elements.forEach(element => {
        if (element.textContent.trim()) {
            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor;
            const textColor = style.color;
            
            // Skip elements with transparent backgrounds
            if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
                return;
            }
            
            // Check if text color is white or very light
            const rgb = textColor.match(/\d+/g);
            if (rgb) {
                const [r, g, b] = rgb.map(Number);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                
                // If text is light (white or near white)
                if (brightness > 200) {
                    const bgRgb = bgColor.match(/\d+/g);
                    if (bgRgb) {
                        const [bgR, bgG, bgB] = bgRgb.map(Number);
                        const bgBrightness = (bgR * 299 + bgG * 587 + bgB * 114) / 1000;
                        
                        // If background is also light, make text dark
                        if (bgBrightness > 180) {
                            element.style.color = '#1a1a1a';
                            element.style.textShadow = 'none';
                        }
                    }
                }
            }
        }
    });
}

// Run on page load and after dynamic content loads
document.addEventListener('DOMContentLoaded', fixTextContrast);
window.addEventListener('load', fixTextContrast);

// Also run when AJAX content loads (if you have any)
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(fixTextContrast);
    observer.observe(document.body, { childList: true, subtree: true });
}


// Copy this and paste in browser console to check contrast
function debugContrastIssues() {
    const elements = document.querySelectorAll('*');
    const issues = [];
    
    elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const color = style.color;
        const text = el.textContent?.trim();
        
        if (text && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            const bgMatch = bg.match(/\d+/g);
            const colorMatch = color.match(/\d+/g);
            
            if (bgMatch && colorMatch) {
                const [br, bg, bb] = bgMatch.map(Number);
                const [cr, cg, cb] = colorMatch.map(Number);
                
                const bgBrightness = (br * 299 + bg * 587 + bb * 114) / 1000;
                const colorBrightness = (cr * 299 + cg * 587 + cb * 114) / 1000;
                
                // Check if both are light colors
                if (bgBrightness > 180 && colorBrightness > 180) {
                    issues.push({
                        element: el,
                        tag: el.tagName,
                        text: text.substring(0, 50),
                        bgColor: bg,
                        textColor: color
                    });
                }
            }
        }
    });
    
    console.log(`Found ${issues.length} contrast issues:`);
    issues.forEach((issue, i) => {
        console.log(`%c${i + 1}. ${issue.tag}: "${issue.text}"`, `color: ${issue.textColor}; background: ${issue.bgColor}`);
        console.log('   Text Color:', issue.textColor);
        console.log('   Background:', issue.bgColor);
        console.log('---');
    });
    
    return issues;
}