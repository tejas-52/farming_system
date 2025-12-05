// Marketplace Page JavaScript

// Global variables
let products = [];
let filteredProducts = [];
let favorites = JSON.parse(localStorage.getItem('marketplaceFavorites')) || [];
let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
let priceChart = null;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize marketplace
    initMarketplace();
    
    // Load products
    loadProducts();
    
    // Initialize price trends chart
    initPriceChart();
    
    // Initialize event listeners
    initMarketplaceListeners();
    
    // Initialize chatbot with marketplace context
    initMarketplaceChatbot();
    
    // Update favorites and compare indicators
    updateIndicators();
});

// Initialize Marketplace
function initMarketplace() {
    // Check if user is logged in
    checkAuthState();
    
    // Initialize sell form
    initSellForm();
    
    // Initialize filter modal
    initFilterModal();
    
    // Initialize image upload
    initImageUpload();
}

// Initialize Event Listeners
function initMarketplaceListeners() {
    // Search on enter key
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
    
    // Sell form submission
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        sellForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitProduct();
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Close modals on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Load Products
function loadProducts() {
    // In a real app, this would fetch from API
    // For now, we'll use the products from HTML
    const productCards = document.querySelectorAll('.product-card');
    products = Array.from(productCards).map(card => {
        return {
            element: card,
            category: card.dataset.category,
            price: parseFloat(card.dataset.price),
            rating: parseFloat(card.dataset.rating),
            date: new Date(card.dataset.date)
        };
    });
    
    filteredProducts = [...products];
    
    // Mark favorites
    updateFavoritesDisplay();
}

// Search Products
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase().trim();
    
    if (!searchTerm) {
        // Show all products if search is empty
        filteredProducts.forEach(item => {
            item.element.style.display = 'block';
        });
        return;
    }
    
    filteredProducts.forEach(item => {
        const card = item.element;
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        const farmer = card.querySelector('.product-farmer').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || farmer.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter by Category
function filterByCategory(category) {
    // Update active filter tag
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (category === 'all') {
        filteredProducts.forEach(item => {
            item.element.style.display = 'block';
        });
    } else {
        filteredProducts.forEach(item => {
            if (item.category === category) {
                item.element.style.display = 'block';
            } else {
                item.element.style.display = 'none';
            }
        });
    }
}

// Sort Products
function sortProducts() {
    const sortBy = document.getElementById('sortProducts').value;
    
    // Get visible products
    const visibleProducts = filteredProducts.filter(item => 
        item.element.style.display !== 'none'
    );
    
    // Sort based on selected option
    visibleProducts.sort((a, b) => {
        switch(sortBy) {
            case 'price_low':
                return a.price - b.price;
            case 'price_high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'popular':
                // Simulating popularity with random data
                return Math.random() - 0.5;
            case 'newest':
            default:
                return b.date - a.date;
        }
    });
    
    // Reorder products in DOM
    const productsGrid = document.getElementById('productsGrid');
    visibleProducts.forEach(item => {
        productsGrid.appendChild(item.element);
    });
}

// Open Sell Modal
function openSellModal() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('auth_token');
    
    if (!isLoggedIn) {
        showNotification('Please login to sell products', 'warning');
        window.location.href = 'login.html?redirect=marketplace.html';
        return;
    }
    
    const modal = document.getElementById('sellModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Open Filter Modal
function openFilterModal() {
    const modal = document.getElementById('filterModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// Initialize Sell Form
function initSellForm() {
    const sellForm = document.getElementById('sellForm');
    if (!sellForm) return;
    
    // Reset form on modal close
    const sellModal = document.getElementById('sellModal');
    if (sellModal) {
        sellModal.addEventListener('hidden.bs.modal', function() {
            sellForm.reset();
            document.getElementById('imagePreview').innerHTML = '';
        });
    }
}

// Initialize Image Upload
function initImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!uploadArea || !imageInput || !imagePreview) return;
    
    // Click on upload area to trigger file input
    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });
    
    // Handle file selection
    imageInput.addEventListener('change', function(e) {
        const files = e.target.files;
        imagePreview.innerHTML = '';
        
        // Limit to 5 images
        const fileCount = Math.min(files.length, 5);
        
        for (let i = 0; i < fileCount; i++) {
            const file = files[i];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select image files only', 'warning');
                continue;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification(`Image ${file.name} is too large (max 5MB)`, 'warning');
                continue;
            }
            
            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image" onclick="removeImage(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                imagePreview.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        }
        
        // Reset file input
        imageInput.value = '';
    });
    
    // Drag and drop support
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--secondary)';
        uploadArea.style.background = 'rgba(255, 152, 0, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border)';
        uploadArea.style.background = 'var(--bg-light)';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border)';
        uploadArea.style.background = 'var(--bg-light)';
        
        const files = e.dataTransfer.files;
        imageInput.files = files;
        imageInput.dispatchEvent(new Event('change'));
    });
}

// Remove Image
function removeImage(button) {
    const previewItem = button.closest('.image-preview-item');
    previewItem.remove();
}

// Submit Product
function submitProduct() {
    const form = document.getElementById('sellForm');
    const formData = new FormData(form);
    
    // Basic validation
    const productName = form.querySelector('input[type="text"]').value;
    const price = form.querySelector('input[type="number"]').value;
    
    if (!productName || !price) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listing...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Success
        showNotification('Product listed successfully! It will appear in marketplace after review.', 'success');
        
        // Reset form
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        // Close modal
        closeModal();
        
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Refresh products
        refreshProducts();
        
    }, 1500);
}

// Initialize Filter Modal
function initFilterModal() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    
    if (priceMin && priceMax) {
        // Set initial values
        updatePriceRange();
        
        // Add event listeners
        priceMin.addEventListener('input', updatePriceRange);
        priceMax.addEventListener('input', updatePriceRange);
    }
}

// Update Price Range Display
function updatePriceRange() {
    const minValue = document.getElementById('priceMin').value;
    const maxValue = document.getElementById('priceMax').value;
    
    document.getElementById('minPriceValue').textContent = minValue;
    document.getElementById('maxPriceValue').textContent = maxValue;
}

// Apply Filters
function applyFilters() {
    const minPrice = parseFloat(document.getElementById('priceMin').value);
    const maxPrice = parseFloat(document.getElementById('priceMax').value);
    const state = document.getElementById('stateFilter').value;
    const city = document.getElementById('cityFilter').value.toLowerCase().trim();
    
    // Get selected conditions
    const conditionCheckboxes = document.querySelectorAll('.condition-filters input[type="checkbox"]:checked');
    const conditions = Array.from(conditionCheckboxes).map(cb => cb.value);
    
    // Get selected rating
    const ratingRadio = document.querySelector('.rating-filters input[type="radio"]:checked');
    const minRating = ratingRadio ? parseFloat(ratingRadio.value) : 0;
    
    // Apply filters
    filteredProducts.forEach(item => {
        const card = item.element;
        const price = item.price;
        const rating = item.rating;
        const location = card.querySelector('.product-location').textContent.toLowerCase();
        const badges = Array.from(card.querySelectorAll('.product-badge')).map(b => 
            b.className.replace('product-badge ', '').trim()
        );
        
        // Check price range
        const priceMatch = price >= minPrice && price <= maxPrice;
        
        // Check location
        let locationMatch = true;
        if (state && !location.includes(state.toLowerCase())) {
            locationMatch = false;
        }
        if (city && !location.includes(city)) {
            locationMatch = false;
        }
        
        // Check conditions
        let conditionMatch = conditions.length === 0;
        if (conditions.length > 0) {
            conditionMatch = conditions.some(condition => badges.includes(condition));
        }
        
        // Check rating
        const ratingMatch = rating >= minRating;
        
        // Show/hide based on all filters
        if (priceMatch && locationMatch && conditionMatch && ratingMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Close modal
    closeModal();
    
    // Show results count
    const visibleCount = filteredProducts.filter(item => 
        item.element.style.display !== 'none'
    ).length;
    
    showNotification(`Found ${visibleCount} products matching your filters`, 'info');
}

// Reset Filters
function resetFilters() {
    // Reset form elements
    document.getElementById('priceMin').value = 0;
    document.getElementById('priceMax').value = 1000;
    document.getElementById('stateFilter').value = '';
    document.getElementById('cityFilter').value = '';
    
    document.querySelectorAll('.condition-filters input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    document.querySelector('.rating-filters input[type="radio"][value="1"]').checked = true;
    
    // Update display
    updatePriceRange();
    
    // Show all products
    filteredProducts.forEach(item => {
        item.element.style.display = 'block';
    });
    
    // Close modal
    closeModal();
    
    showNotification('Filters reset successfully', 'info');
}

// Initialize Price Chart
function initPriceChart() {
    const ctx = document.getElementById('priceTrendsChart').getContext('2d');
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Tomato Price (₹/kg)',
                data: [22, 25, 28, 30, 28, 25, 30],
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Onion Price (₹/kg)',
                data: [20, 22, 25, 28, 30, 28, 25],
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
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
                    },
                    title: {
                        display: true,
                        text: 'Price (₹/kg)'
                    }
                }
            }
        }
    });
}

// Update Price Trends
function updatePriceTrends() {
    const category = document.getElementById('trendCategory').value;
    const period = document.getElementById('trendPeriod').value;
    
    // In a real app, this would fetch data from API
    // For now, we'll update with sample data
    let data1, data2, label1, label2;
    
    switch(category) {
        case 'vegetables':
            label1 = 'Tomato Price (₹/kg)';
            label2 = 'Onion Price (₹/kg)';
            data1 = [22, 25, 28, 30, 28, 25, 30];
            data2 = [20, 22, 25, 28, 30, 28, 25];
            break;
        case 'fruits':
            label1 = 'Apple Price (₹/kg)';
            label2 = 'Banana Price (₹/dozen)';
            data1 = [80, 85, 90, 95, 90, 85, 100];
            data2 = [40, 45, 50, 55, 50, 45, 60];
            break;
        case 'grains':
            label1 = 'Rice Price (₹/kg)';
            label2 = 'Wheat Price (₹/kg)';
            data1 = [60, 65, 70, 75, 70, 65, 80];
            data2 = [20, 22, 25, 28, 25, 22, 30];
            break;
        case 'pulses':
            label1 = 'Chana Price (₹/kg)';
            label2 = 'Moong Price (₹/kg)';
            data1 = [70, 75, 80, 85, 80, 75, 90];
            data2 = [80, 85, 90, 95, 90, 85, 100];
            break;
    }
    
    // Update chart labels based on period
    let labels;
    switch(period) {
        case 'weekly':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            break;
        case 'monthly':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data1 = data1.slice(0, 4);
            data2 = data2.slice(0, 4);
            break;
        case 'quarterly':
            labels = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
            data1 = [data1[0], data1[2], data1[4], data1[6]];
            data2 = [data2[0], data2[2], data2[4], data2[6]];
            break;
    }
    
    // Update chart
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].label = label1;
    priceChart.data.datasets[0].data = data1;
    priceChart.data.datasets[1].label = label2;
    priceChart.data.datasets[1].data = data2;
    priceChart.update();
}

// View Product Details
function viewProductDetails(productId) {
    const productData = getProductData(productId);
    const modal = document.getElementById('productModal');
    const modalName = document.getElementById('modalProductName');
    const modalBody = document.querySelector('#productModal .modal-body');
    
    modalName.textContent = productData.name;
    
    modalBody.innerHTML = `
        <div class="product-details">
            <div class="product-gallery">
                <div class="main-image">
                    <img src="${productData.image}" alt="${productData.name}">
                </div>
                <div class="thumbnails">
                    <img src="${productData.image}" alt="Thumbnail 1" class="active">
                    <img src="https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Thumbnail 2">
                    <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Thumbnail 3">
                </div>
            </div>
            
            <div class="product-info-details">
                <div class="product-header">
                    <h2>${productData.name}</h2>
                    <div class="product-meta">
                        <span class="rating">
                            <i class="fas fa-star"></i> ${productData.rating}/5
                        </span>
                        <span class="sold">
                            <i class="fas fa-shopping-cart"></i> ${productData.sold}+ sold
                        </span>
                        <span class="available">
                            <i class="fas fa-check-circle"></i> In Stock
                        </span>
                    </div>
                </div>
                
                <div class="product-price-details">
                    <div class="current-price">₹${productData.price}</div>
                    <div class="old-price">₹${productData.oldPrice}</div>
                    <div class="discount">Save ${productData.discount}%</div>
                </div>
                
                <div class="product-specs-details">
                    <h3>Specifications</h3>
                    <ul>
                        ${productData.specs.map(spec => `<li>${spec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="seller-info">
                    <h3>Seller Information</h3>
                    <div class="seller-card">
                        <img src="${productData.seller.avatar}" alt="${productData.seller.name}">
                        <div class="seller-details">
                            <h4>${productData.seller.name}</h4>
                            <p><i class="fas fa-map-marker-alt"></i> ${productData.seller.location}</p>
                            <div class="seller-rating">
                                <i class="fas fa-star"></i>
                                <span>${productData.seller.rating}/5 (${productData.seller.reviews} reviews)</span>
                            </div>
                            <div class="seller-stats">
                                <span>${productData.seller.products} Products</span>
                                <span>${productData.seller.memberSince} Member Since</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="product-actions-details">
                    <div class="quantity-selector">
                        <label>Quantity:</label>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="updateQuantity(-1)">-</button>
                            <input type="number" value="1" min="1" max="100" id="productQuantity">
                            <button class="qty-btn" onclick="updateQuantity(1)">+</button>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-lg" onclick="buyNow('${productId}')">
                            <i class="fas fa-shopping-cart"></i> Buy Now
                        </button>
                        <button class="btn btn-outline btn-lg" onclick="addToCart('${productId}')">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline btn-lg" onclick="contactSeller('${productId}')">
                            <i class="fas fa-comment"></i> Contact Seller
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add thumbnail click handlers
    const thumbnails = modalBody.querySelectorAll('.thumbnails img');
    const mainImage = modalBody.querySelector('.main-image img');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            mainImage.src = this.src;
        });
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Get Product Data
function getProductData(productId) {
    const products = {
        'tomatoes': {
            name: 'Fresh Organic Tomatoes',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            price: 25,
            oldPrice: 30,
            discount: 17,
            rating: 4.8,
            sold: 150,
            specs: [
                '100% Organic - No pesticides or chemicals',
                'Harvested daily for maximum freshness',
                'Perfect for salads, cooking, and sauces',
                'Rich in vitamins A, C, and antioxidants',
                'Shelf life: 7-10 days at room temperature'
            ],
            seller: {
                name: 'Rajesh Kumar',
                avatar: 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                location: 'Nashik, Maharashtra',
                rating: 4.8,
                reviews: 120,
                products: 15,
                memberSince: '2022'
            }
        }
        // Add more products as needed
    };
    
    return products[productId] || products['tomatoes'];
}

// Update Quantity
function updateQuantity(change) {
    const quantityInput = document.getElementById('productQuantity');
    let quantity = parseInt(quantityInput.value) || 1;
    quantity = Math.max(1, Math.min(100, quantity + change));
    quantityInput.value = quantity;
}

// Buy Now
function buyNow(productId) {
    const quantity = document.getElementById('productQuantity').value;
    showNotification(`Added ${quantity} items to checkout`, 'success');
    closeModal();
}

// Add to Cart
function addToCart(productId) {
    const quantity = document.getElementById('productQuantity').value;
    showNotification(`Added ${quantity} items to cart`, 'success');
}

// Contact Seller
function contactSeller(productId) {
    showNotification('Opening chat with seller...', 'info');
    closeModal();
    setTimeout(() => {
        openChatbot();
    }, 500);
}

// View Farmer Profile
function viewFarmerProfile(farmerId) {
    showNotification(`Loading ${farmerId}'s profile...`, 'info');
    // In a real app, this would redirect to farmer profile page
}

// Toggle Favorite
function toggleFavorite(button) {
    const productCard = button.closest('.product-card');
    const productId = productCard.querySelector('.product-title').textContent;
    
    const heartIcon = button.querySelector('i');
    
    if (heartIcon.classList.contains('far')) {
        // Add to favorites
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        button.classList.add('active');
        
        favorites.push(productId);
        showNotification('Added to favorites', 'success');
    } else {
        // Remove from favorites
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        button.classList.remove('active');
        
        favorites = favorites.filter(id => id !== productId);
        showNotification('Removed from favorites', 'info');
    }
    
    // Save to localStorage
    localStorage.setItem('marketplaceFavorites', JSON.stringify(favorites));
}

// Add to Compare
function addToCompare(button) {
    const productCard = button.closest('.product-card');
    const productId = productCard.querySelector('.product-title').textContent;
    
    if (compareList.includes(productId)) {
        // Already in compare list
        showNotification('Already in compare list', 'info');
        return;
    }
    
    if (compareList.length >= 3) {
        showNotification('Compare list is full (max 3 products)', 'warning');
        return;
    }
    
    compareList.push(productId);
    button.classList.add('active');
    
    localStorage.setItem('compareList', JSON.stringify(compareList));
    showNotification('Added to compare list', 'success');
}

// Update Favorites Display
function updateFavoritesDisplay() {
    const favoriteButtons = document.querySelectorAll('.action-btn.favorite');
    
    favoriteButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        const productId = productCard.querySelector('.product-title').textContent;
        
        if (favorites.includes(productId)) {
            const heartIcon = button.querySelector('i');
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            button.classList.add('active');
        }
    });
}

// Update Indicators
function updateIndicators() {
    // Update compare count
    if (compareList.length > 0) {
        // You could add a badge to compare button
    }
}

// Load More Products
function loadMoreProducts() {
    const loadButton = document.querySelector('.load-more .btn');
    const originalText = loadButton.innerHTML;
    
    loadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadButton.disabled = true;
    
    // Simulate loading more products
    setTimeout(() => {
        // Add more product cards (simulated)
        const productsGrid = document.getElementById('productsGrid');
        const newProducts = [
            {
                name: 'Fresh Carrots',
                category: 'vegetables',
                price: 30,
                rating: 4.5,
                image: 'https://images.unsplash.com/photo-1598170845058-78132e1b46d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                description: 'Sweet and crunchy carrots, rich in vitamin A.',
                farmer: 'Vegetable Farm Co.',
                location: 'Bengaluru, KA'
            },
            {
                name: 'Organic Apples',
                category: 'fruits',
                price: 120,
                rating: 4.7,
                image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                description: 'Crisp and juicy organic apples from Kashmir.',
                farmer: 'Kashmir Apple Farms',
                location: 'Srinagar, JK'
            }
        ];
        
        newProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
        
        // Update product list
        loadProducts();
        
        // Update button
        loadButton.innerHTML = originalText;
        loadButton.disabled = false;
        
        showNotification('More products loaded successfully!', 'success');
        
    }, 1500);
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    card.dataset.price = product.price;
    card.dataset.rating = product.rating;
    card.dataset.date = new Date().toISOString().split('T')[0];
    
    card.innerHTML = `
        <div class="product-badge organic">Organic</div>
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-actions">
                <button class="action-btn favorite" onclick="toggleFavorite(this)">
                    <i class="far fa-heart"></i>
                </button>
                <button class="action-btn compare" onclick="addToCompare(this)">
                    <i class="fas fa-balance-scale"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <div class="product-header">
                <h3 class="product-title">${product.name}</h3>
                <span class="product-rating">
                    <i class="fas fa-star"></i> ${product.rating}
                </span>
            </div>
            
            <div class="product-meta">
                <span class="product-farmer">
                    <i class="fas fa-user"></i> ${product.farmer}
                </span>
                <span class="product-location">
                    <i class="fas fa-map-marker-alt"></i> ${product.location}
                </span>
            </div>
            
            <p class="product-description">${product.description}</p>
            
            <div class="product-specs">
                <span class="spec">
                    <i class="fas fa-weight"></i> 100 kg available
                </span>
                <span class="spec">
                    <i class="fas fa-calendar"></i> Fresh Today
                </span>
            </div>
            
            <div class="product-footer">
                <div class="product-price">
                    <span class="price">₹${product.price}/kg</span>
                    <span class="old-price">₹${Math.round(product.price * 1.2)}/kg</span>
                </div>
                <div class="product-cta">
                    <button class="btn btn-sm btn-outline" onclick="viewProductDetails('${product.name.toLowerCase()}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="contactSeller('${product.name.toLowerCase()}')">
                        <i class="fas fa-shopping-cart"></i> Buy
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Refresh Products
function refreshProducts() {
    const refreshBtn = event?.target || document.querySelector('[onclick="refreshProducts()"]');
    const originalText = refreshBtn?.innerHTML;
    
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
    }
    
    // Simulate refresh
    setTimeout(() => {
        // In a real app, this would fetch fresh data from API
        showNotification('Products refreshed successfully!', 'success');
        
        if (refreshBtn) {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }
    }, 1000);
}

// Initialize Marketplace Chatbot
function initMarketplaceChatbot() {
    // Override chatbot responses for marketplace context
    window.getBotResponse = function(message) {
        const msg = message.toLowerCase();
        
        // Marketplace-related responses
        if (msg.includes('buy') || msg.includes('purchase') || msg.includes('price')) {
            const responses = [
                "You can browse products by category or use the search bar to find specific items. Click 'Buy' on any product to contact the seller.",
                "Check the price trends section for current market rates. You can compare prices before making a purchase.",
                "All prices are set by verified farmers. You can negotiate directly with sellers for bulk purchases."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        if (msg.includes('sell') || msg.includes('list') || msg.includes('product')) {
            return "To sell products, click the 'Sell Product' button. You'll need to create an account first and get verified as a farmer.";
        }
        
        if (msg.includes('farm') || msg.includes('farmer') || msg.includes('seller')) {
            return "We have 800+ verified farmers on our platform. Check the 'Featured Farmers' section to see top-rated sellers.";
        }
        
        if (msg.includes('delivery') || msg.includes('shipping') || msg.includes('transport')) {
            return "Delivery options vary by seller. Some offer home delivery, while others prefer pickup. You can discuss delivery arrangements directly with the seller.";
        }
        
        // Default responses
        const defaultResponses = [
            "I'm your marketplace assistant! I can help you find products, compare prices, or connect with farmers.",
            "How can I help you with buying or selling farm products today?",
            "Check out our featured products or use the search bar to find what you're looking for."
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.marketplace-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `marketplace-notification notification-${type}`;
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
    if (!document.querySelector('#marketplace-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'marketplace-notification-styles';
        styles.textContent = `
            .marketplace-notification {
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
                border-left: 4px solid #ff9800;
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
                color: #ff9800;
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