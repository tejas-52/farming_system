// dashboard.js - Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    // Initialize charts
    initCharts();
    
    // Initialize modals
    initModals();
    
    // Initialize date pickers
    initDatePickers();
    
    // Load any saved data
    loadSavedData();
}

function initCharts() {
    // Crop Health Chart
    const cropHealthCtx = document.getElementById('cropHealthChart');
    if (cropHealthCtx) {
        new Chart(cropHealthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Crop Health',
                    data: [7.2, 7.8, 8.1, 8.3, 8.2, 8.4],
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 6,
                        max: 10,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }
}

function initModals() {
    const activityModal = document.getElementById('activityModal');
    
    if (activityModal) {
        activityModal.addEventListener('click', function(e) {
            if (e.target === activityModal) {
                closeActivityModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeActivityModal();
        }
    });
}

function initDatePickers() {
    // Initialize date picker for activity form
    const activityDate = document.getElementById('activityDate');
    if (activityDate) {
        activityDate.min = new Date().toISOString().split('T')[0];
    }
}

function addNewActivity() {
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('activityTitle').focus();
    }
}

function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('activityForm').reset();
    }
}

function saveActivity() {
    const type = document.getElementById('activityType').value;
    const title = document.getElementById('activityTitle').value.trim();
    const description = document.getElementById('activityDescription').value.trim();
    const date = document.getElementById('activityDate').value;
    const time = document.getElementById('activityTime').value;
    
    if (!type || !title) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create activity object
    const activity = {
        id: Date.now(),
        type: type,
        title: title,
        description: description,
        date: date,
        time: time,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    saveActivityToStorage(activity);
    
    // Add to UI
    addActivityToUI(activity);
    
    // Close modal
    closeActivityModal();
    
    // Show success message
    showNotification('Activity saved successfully!');
}

function saveActivityToStorage(activity) {
    let activities = JSON.parse(localStorage.getItem('smartfarm_activities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('smartfarm_activities', JSON.stringify(activities));
}

function addActivityToUI(activity) {
    const activitiesList = document.querySelector('.activities-list');
    if (!activitiesList) return;
    
    // Remove empty state if exists
    const emptyState = activitiesList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Create activity item
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-${getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
            <h4>${activity.title}</h4>
            <p>${activity.description}</p>
            <span class="activity-time">
                <i class="far fa-clock"></i>
                Just now
            </span>
        </div>
    `;
    
    // Add to list
    activitiesList.prepend(activityItem);
}

function getActivityIcon(type) {
    const icons = {
        'planting': 'seedling',
        'watering': 'tint',
        'fertilizing': 'flask',
        'harvesting': 'apple-alt',
        'pest_control': 'bug',
        'soil_testing': 'vial',
        'equipment': 'tools',
        'other': 'clipboard-list'
    };
    return icons[type] || 'clipboard-list';
}

function markTaskComplete(taskId) {
    // Remove task from UI
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskCard) {
        taskCard.style.opacity = '0.5';
        taskCard.style.textDecoration = 'line-through';
        
        setTimeout(() => {
            taskCard.remove();
            updateTaskCount();
        }, 1000);
    }
    
    showNotification('Task marked as complete!');
}

function updateTaskCount() {
    const taskCount = document.querySelectorAll('.task-card').length;
    if (taskCount === 0) {
        // Show empty state
        const tasksGrid = document.querySelector('.tasks-grid');
        if (tasksGrid) {
            tasksGrid.innerHTML = `
                <div class="empty-state-large">
                    <i class="fas fa-tasks"></i>
                    <h3>No upcoming tasks</h3>
                    <p>You're all caught up! Add new tasks to stay organized.</p>
                    <button class="btn btn-primary" onclick="addNewTask()">
                        <i class="fas fa-plus"></i> Add New Task
                    </button>
                </div>
            `;
        }
    }
}

function addNewTask() {
    const task = {
        id: Date.now(),
        category: prompt('Enter task category (e.g., Watering, Fertilizing):', 'Watering'),
        priority: prompt('Enter priority (high/medium/low):', 'medium'),
        title: prompt('Enter task title:', 'New farming task'),
        description: prompt('Enter task description:', ''),
        due_date: prompt('Enter due date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]),
        assigned_to: prompt('Assigned to:', 'You')
    };
    
    if (task.title && task.category) {
        // Reload page to show new task (in real app, would add dynamically)
        showNotification('Task added! Refresh page to see it.');
    }
}

function addNewCrop() {
    showNotification('Redirecting to crop management...');
    setTimeout(() => {
        window.location.href = 'crops.html';
    }, 1000);
}

function addNewFarm() {
    const farmName = prompt('Enter your farm name:', 'My Farm');
    const location = prompt('Enter farm location:', '');
    
    if (farmName) {
        // Save to localStorage
        localStorage.setItem('smartfarm_farm_name', farmName);
        localStorage.setItem('smartfarm_farm_location', location);
        
        // Update UI
        const farmBadge = document.querySelector('.farm-badge span');
        const locationBadge = document.querySelector('.location-badge span');
        
        if (farmBadge) farmBadge.textContent = farmName;
        if (locationBadge && location) locationBadge.textContent = location;
        
        showNotification('Farm information updated!');
    }
}

function showAllActivities() {
    const activities = JSON.parse(localStorage.getItem('smartfarm_activities') || '[]');
    if (activities.length > 0) {
        let message = 'Your activities:\n\n';
        activities.forEach(activity => {
            message += `📅 ${activity.date} - ${activity.title}\n`;
        });
        alert(message);
    } else {
        alert('No activities recorded yet.');
    }
}

function loadSavedData() {
    // Load farm info from localStorage
    const farmName = localStorage.getItem('smartfarm_farm_name');
    const farmLocation = localStorage.getItem('smartfarm_farm_location');
    
    if (farmName) {
        const farmBadge = document.querySelector('.farm-badge span');
        if (farmBadge) farmBadge.textContent = farmName;
    }
    
    if (farmLocation) {
        const locationBadge = document.querySelector('.location-badge span');
        if (locationBadge) locationBadge.textContent = farmLocation;
    }
    
    // Load activities from localStorage
    const activities = JSON.parse(localStorage.getItem('smartfarm_activities') || '[]');
    const activitiesList = document.querySelector('.activities-list');
    
    if (activities.length > 0 && activitiesList) {
        const emptyState = activitiesList.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        activities.slice(0, 5).forEach(activity => {
            if (!document.querySelector(`[data-activity-id="${activity.id}"]`)) {
                addActivityToUI(activity);
            }
        });
    }
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

// Add CSS for notifications
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
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
document.head.appendChild(notificationStyle);