// forum.js - Forum Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initForum();
});

function initForum() {
    // Initialize forum functionality
    initCreatePostModal();
    initCategoryFilter();
    initSearch();
    initViewToggle();
    initCharacterCounter();
    loadForumData();
}

// Create Post Modal
function initCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    const createBtn = document.querySelector('.btn-primary[onclick="openCreatePostModal()"]');
    
    if (createBtn) {
        createBtn.addEventListener('click', openCreatePostModal);
    }
    
    // Close modal on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCreatePostModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeCreatePostModal();
        }
    });
}

function openCreatePostModal() {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        showNotification('Please login to create a post', 'error');
        window.location.href = 'login.html?redirect=forum.html';
        return;
    }
    
    const modal = document.getElementById('createPostModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on title input
    setTimeout(() => {
        document.getElementById('postTitle').focus();
    }, 100);
}

function closeCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('createPostForm').reset();
    document.getElementById('charCount').textContent = '0';
}

// Character counter for post content
function initCharacterCounter() {
    const textarea = document.getElementById('postContent');
    if (!textarea) return;
    
    textarea.addEventListener('input', function() {
        const charCount = document.getElementById('charCount');
        charCount.textContent = this.value.length;
        
        if (this.value.length > 2000) {
            charCount.style.color = '#f44336';
        } else if (this.value.length > 1800) {
            charCount.style.color = '#ff9800';
        } else {
            charCount.style.color = 'var(--text-light)';
        }
    });
}

// Submit new post
function submitPost() {
    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value.trim();
    const tags = document.getElementById('postTags').value.trim();
    
    // Validation
    if (!title) {
        showNotification('Please enter a title', 'error');
        document.getElementById('postTitle').focus();
        return;
    }
    
    if (!category) {
        showNotification('Please select a category', 'error');
        return;
    }
    
    if (!content) {
        showNotification('Please enter post content', 'error');
        document.getElementById('postContent').focus();
        return;
    }
    
    if (content.length > 2000) {
        showNotification('Content exceeds 2000 characters limit', 'error');
        return;
    }
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const username = userData.full_name || 'Anonymous Farmer';
    const userRole = userData.role || 'Farmer';
    const userAvatar = userData.avatar || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
    
    // Create new discussion object
    const newDiscussion = {
        id: Date.now(),
        title: title,
        category: category,
        content: content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author: {
            name: username,
            role: userRole,
            avatar: userAvatar
        },
        date: new Date().toISOString(),
        views: 0,
        replies: 0,
        likes: 0,
        status: 'active',
        isNew: true
    };
    
    // Save to localStorage
    saveDiscussion(newDiscussion);
    
    // Add to forum display
    addDiscussionToUI(newDiscussion);
    
    // Close modal
    closeCreatePostModal();
    
    // Show success message
    showNotification('Discussion created successfully!', 'success');
    
    // Scroll to new post
    setTimeout(() => {
        const newPost = document.querySelector('.discussion-card[data-id="' + newDiscussion.id + '"]');
        if (newPost) {
            newPost.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

function saveDiscussion(discussion) {
    let discussions = JSON.parse(localStorage.getItem('forum_discussions') || '[]');
    discussions.unshift(discussion); // Add to beginning
    localStorage.setItem('forum_discussions', JSON.stringify(discussions));
}

function addDiscussionToUI(discussion) {
    const container = document.getElementById('discussionsContainer');
    
    // Create discussion card
    const discussionCard = document.createElement('div');
    discussionCard.className = 'discussion-card new-post';
    discussionCard.setAttribute('data-id', discussion.id);
    discussionCard.setAttribute('data-category', discussion.category);
    discussionCard.setAttribute('data-views', discussion.views);
    discussionCard.setAttribute('data-replies', discussion.replies);
    discussionCard.setAttribute('data-date', discussion.date);
    
    // Format date
    const date = new Date(discussion.date);
    const timeAgo = getTimeAgo(date);
    
    // Category display name
    const categoryNames = {
        'crops': 'Crop Cultivation',
        'pests': 'Pests & Diseases',
        'soil': 'Soil & Fertilizers',
        'weather': 'Weather & Irrigation',
        'market': 'Market & Prices',
        'equipment': 'Equipment & Tools',
        'organic': 'Organic Farming',
        'success': 'Success Stories',
        'help': 'Help & Support'
    };
    
    // Create HTML
    discussionCard.innerHTML = `
        <div class="discussion-header">
            <div class="discussion-status">
                <span class="status-badge new">
                    <i class="fas fa-star"></i> New
                </span>
                <span class="category-badge">${categoryNames[discussion.category] || 'General'}</span>
            </div>
            <div class="discussion-meta">
                <span class="discussion-time">
                    <i class="far fa-clock"></i> ${timeAgo}
                </span>
            </div>
        </div>
        
        <div class="discussion-body">
            <h3 class="discussion-title">
                <a href="discussion-detail.html?id=${discussion.id}">${discussion.title}</a>
            </h3>
            <p class="discussion-excerpt">${discussion.content.substring(0, 150)}${discussion.content.length > 150 ? '...' : ''}</p>
            
            ${discussion.tags.length > 0 ? `
                <div class="discussion-tags">
                    ${discussion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="discussion-footer">
            <div class="discussion-author">
                <div class="author-avatar">
                    <img src="${discussion.author.avatar}" alt="${discussion.author.name}">
                </div>
                <div class="author-info">
                    <span class="author-name">${discussion.author.name}</span>
                    <span class="author-role">${discussion.author.role}</span>
                </div>
            </div>
            
            <div class="discussion-stats">
                <div class="stat">
                    <i class="far fa-eye"></i>
                    <span>${discussion.views} views</span>
                </div>
                <div class="stat">
                    <i class="far fa-comment"></i>
                    <span>${discussion.replies} replies</span>
                </div>
                <div class="stat">
                    <i class="far fa-heart"></i>
                    <span>${discussion.likes} likes</span>
                </div>
            </div>
        </div>
    `;
    
    // Insert at the beginning
    if (container.firstChild) {
        container.insertBefore(discussionCard, container.firstChild);
    } else {
        container.appendChild(discussionCard);
    }
    
    // Update category count
    updateCategoryCount(discussion.category);
}

// Category Filter
function initCategoryFilter() {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('onclick').match(/filterByCategory\('([^']+)'\)/)[1];
            filterByCategory(category);
        });
    });
}

function filterByCategory(category) {
    // Update active category
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        const itemCategory = item.getAttribute('onclick').match(/filterByCategory\('([^']+)'\)/)[1];
        if (itemCategory === category) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Filter discussions
    const discussionCards = document.querySelectorAll('.discussion-card');
    discussionCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            const cardCategory = card.getAttribute('data-category');
            if (cardCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('category', category);
    window.history.replaceState({}, '', url);
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('forumSearch');
    const searchBtn = document.querySelector('.btn-primary[onclick="searchDiscussions()"]');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDiscussions();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchDiscussions);
    }
}

function searchDiscussions() {
    const searchTerm = document.getElementById('forumSearch').value.toLowerCase().trim();
    
    if (!searchTerm) {
        showNotification('Please enter search terms', 'error');
        return;
    }
    
    const discussionCards = document.querySelectorAll('.discussion-card');
    let resultsCount = 0;
    
    discussionCards.forEach(card => {
        const title = card.querySelector('.discussion-title').textContent.toLowerCase();
        const excerpt = card.querySelector('.discussion-excerpt').textContent.toLowerCase();
        const tags = card.querySelectorAll('.tag');
        let hasTagMatch = false;
        
        tags.forEach(tag => {
            if (tag.textContent.toLowerCase().includes(searchTerm)) {
                hasTagMatch = true;
            }
        });
        
        if (title.includes(searchTerm) || excerpt.includes(searchTerm) || hasTagMatch) {
            card.style.display = 'block';
            resultsCount++;
            
            // Highlight search terms
            highlightSearchTerms(card, searchTerm);
        } else {
            card.style.display = 'none';
        }
    });
    
    showNotification(`Found ${resultsCount} discussion${resultsCount !== 1 ? 's' : ''}`, 'success');
}

function highlightSearchTerms(card, term) {
    const title = card.querySelector('.discussion-title');
    const excerpt = card.querySelector('.discussion-excerpt');
    
    // Simple highlighting - in a real app, use more sophisticated highlighting
    const regex = new RegExp(term, 'gi');
    
    if (title) {
        title.innerHTML = title.textContent.replace(regex, match => 
            `<mark class="search-highlight">${match}</mark>`
        );
    }
    
    if (excerpt) {
        excerpt.innerHTML = excerpt.textContent.replace(regex, match => 
            `<mark class="search-highlight">${match}</mark>`
        );
    }
}

// View Toggle
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('onclick').match(/changeView\('([^']+)'\)/)[1];
            changeView(view);
        });
    });
}

function changeView(view) {
    const container = document.getElementById('discussionsContainer');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    // Update active button
    viewBtns.forEach(btn => {
        const btnView = btn.getAttribute('onclick').match(/changeView\('([^']+)'\)/)[1];
        if (btnView === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Change view
    if (view === 'grid') {
        container.classList.add('grid-view');
    } else {
        container.classList.remove('grid-view');
    }
    
    // Save preference
    localStorage.setItem('forum_view', view);
}

// Sort Discussions
function sortDiscussions() {
    const sortBy = document.getElementById('sortDiscussions').value;
    const container = document.getElementById('discussionsContainer');
    const cards = Array.from(container.querySelectorAll('.discussion-card'));
    
    cards.sort((a, b) => {
        switch (sortBy) {
            case 'latest':
                return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
            case 'popular':
                const bViews = parseInt(b.getAttribute('data-views'));
                const aViews = parseInt(a.getAttribute('data-views'));
                return bViews - aViews;
            case 'trending':
                const bScore = calculateTrendingScore(b);
                const aScore = calculateTrendingScore(a);
                return bScore - aScore;
            case 'unanswered':
                const bReplies = parseInt(b.getAttribute('data-replies'));
                const aReplies = parseInt(a.getAttribute('data-replies'));
                return aReplies - bReplies;
            default:
                return 0;
        }
    });
    
    // Reorder cards
    cards.forEach(card => {
        container.appendChild(card);
    });
}

function calculateTrendingScore(card) {
    const views = parseInt(card.getAttribute('data-views'));
    const replies = parseInt(card.getAttribute('data-replies'));
    const date = new Date(card.getAttribute('data-date'));
    const now = new Date();
    const hoursSincePosted = (now - date) / (1000 * 60 * 60);
    
    // Trending formula: (views + replies * 2) / (hoursSincePosted + 2)
    return (views + replies * 2) / (hoursSincePosted + 2);
}

// Pagination
let currentPage = 1;
const discussionsPerPage = 6;

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
}

function nextPage() {
    const totalPages = Math.ceil(document.querySelectorAll('.discussion-card').length / discussionsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
}

function goToPage(page) {
    currentPage = page;
    updatePagination();
}

function updatePagination() {
    const cards = document.querySelectorAll('.discussion-card');
    const startIndex = (currentPage - 1) * discussionsPerPage;
    const endIndex = startIndex + discussionsPerPage;
    
    cards.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update page buttons
    updatePageButtons();
}

function updatePageButtons() {
    const pageBtns = document.querySelectorAll('.page-btn');
    pageBtns.forEach(btn => {
        const pageNum = parseInt(btn.textContent);
        if (pageNum === currentPage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Load forum data from localStorage
function loadForumData() {
    const discussions = JSON.parse(localStorage.getItem('forum_discussions') || '[]');
    
    // Add to UI if not already present
    discussions.forEach(discussion => {
        if (!document.querySelector(`.discussion-card[data-id="${discussion.id}"]`)) {
            addDiscussionToUI(discussion);
        }
    });
    
    // Update category counts
    updateAllCategoryCounts();
    
    // Load saved view preference
    const savedView = localStorage.getItem('forum_view') || 'list';
    changeView(savedView);
    
    // Initialize pagination
    updatePagination();
}

function updateCategoryCount(category) {
    const categoryItem = document.querySelector(`.category-item[onclick="filterByCategory('${category}')"]`);
    if (categoryItem) {
        const countSpan = categoryItem.querySelector('.category-count');
        let count = parseInt(countSpan.textContent);
        countSpan.textContent = count + 1;
    }
    
    // Update "All Topics" count
    const allItem = document.querySelector(`.category-item[onclick="filterByCategory('all')"]`);
    if (allItem) {
        const allCountSpan = allItem.querySelector('.category-count');
        let allCount = parseInt(allCountSpan.textContent);
        allCountSpan.textContent = allCount + 1;
    }
}

function updateAllCategoryCounts() {
    const discussions = JSON.parse(localStorage.getItem('forum_discussions') || '[]');
    const categoryCounts = {};
    
    // Count discussions per category
    discussions.forEach(discussion => {
        categoryCounts[discussion.category] = (categoryCounts[discussion.category] || 0) + 1;
    });
    
    // Update category items
    Object.keys(categoryCounts).forEach(category => {
        const categoryItem = document.querySelector(`.category-item[onclick="filterByCategory('${category}')"]`);
        if (categoryItem) {
            const countSpan = categoryItem.querySelector('.category-count');
            countSpan.textContent = categoryCounts[category];
        }
    });
    
    // Update "All Topics" count
    const allItem = document.querySelector(`.category-item[onclick="filterByCategory('all')"]`);
    if (allItem) {
        const allCountSpan = allItem.querySelector('.category-count');
        allCountSpan.textContent = discussions.length;
    }
}

// Utility Functions
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

function showNotification(message, type = 'success') {
    // Use existing notification function from script.js
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback notification
        alert(message);
    }
}

// Add CSS for search highlighting
const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
    .search-highlight {
        background: #FFF9C4;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
    }
`;
document.head.appendChild(highlightStyle);