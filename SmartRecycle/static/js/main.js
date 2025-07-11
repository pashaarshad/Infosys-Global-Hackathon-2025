// SmartRecycle - Main JavaScript File

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
});

// Waste Guide Functions
function checkWaste() {
    const itemInput = document.getElementById('waste-item');
    const resultContainer = document.getElementById('result-container');
    
    if (!itemInput || !itemInput.value.trim()) {
        showMessage('Please enter a waste item to check', 'warning');
        return;
    }

    const item = itemInput.value.trim();
    
    fetch('/check-waste', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: item })
    })
    .then(response => response.json())
    .then(data => {
        displayWasteResult(data, resultContainer);
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error checking waste item. Please try again.', 'error');
    });
}

function displayWasteResult(data, container) {
    let resultClass = 'result-unknown';
    let statusText = 'Unknown';
    
    if (data.recyclable === true) {
        resultClass = 'result-recyclable';
        statusText = 'Recyclable ✅';
    } else if (data.recyclable === false) {
        resultClass = 'result-non-recyclable';
        statusText = 'Not Recyclable ❌';
    }

    container.innerHTML = `
        <div class="result-container ${resultClass} fade-in">
            <div class="result-emoji">${data.emoji}</div>
            <h3 class="result-title">${data.item}</h3>
            <div class="result-status">
                <strong>${statusText}</strong>
            </div>
            <div class="result-category" style="background-color: ${data.color}; color: white;">
                ${data.category}
            </div>
            <p class="result-tip">💡 ${data.tip}</p>
        </div>
    `;
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth' });
}

// Pickup Request Functions
function submitPickupRequest() {
    const form = document.getElementById('pickup-form');
    const formData = new FormData(form);
    
    const data = {
        name: formData.get('name'),
        address: formData.get('address'),
        contact: formData.get('contact'),
        waste_type: formData.get('waste_type'),
        quantity: formData.get('quantity'),
        pickup_time: formData.get('pickup_time')
    };

    // Validate required fields
    if (!data.name || !data.address || !data.contact || !data.waste_type || !data.quantity || !data.pickup_time) {
        showMessage('Please fill in all required fields', 'warning');
        return;
    }

    fetch('/submit-pickup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage(result.message, 'success');
            form.reset();
            // Simulate points earned
            setTimeout(() => {
                showMessage('🎉 You earned 10 green points for this request!', 'success');
            }, 2000);
        } else {
            showMessage('Error submitting request. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error submitting request. Please try again.', 'error');
    });
}

// Contact Form Functions
function submitContactForm() {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);
    
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    if (!data.name || !data.email || !data.message) {
        showMessage('Please fill in all fields', 'warning');
        return;
    }

    fetch('/submit-contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage(result.message, 'success');
            form.reset();
        } else {
            showMessage('Error sending message. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error sending message. Please try again.', 'error');
    });
}

// Track Impact Functions
function generateImpactData() {
    const wasteSubmitted = Math.floor(Math.random() * 50) + 10; // 10-60 kg
    const pointsEarned = wasteSubmitted * 2;
    const treesSaved = Math.floor(wasteSubmitted / 10);
    const waterSaved = wasteSubmitted * 3;

    return {
        wasteSubmitted,
        pointsEarned,
        treesSaved,
        waterSaved
    };
}

function updateImpactDisplay() {
    const data = generateImpactData();
    
    const elements = {
        'waste-amount': `${data.wasteSubmitted} kg`,
        'points-earned': data.pointsEarned,
        'trees-saved': data.treesSaved,
        'water-saved': `${data.waterSaved} L`
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, 0, parseInt(value) || 0, 1000);
        }
    });
}

// Animation Functions
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const minTimer = 50;
    const stepTime = Math.abs(Math.floor(duration / range));
    const timer = Math.max(stepTime, minTimer);
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    function run() {
        const now = Date.now();
        const remaining = Math.max((endTime - now) / duration, 0);
        const value = Math.round(end - (remaining * range));
        
        element.textContent = value;
        
        if (value !== end) {
            setTimeout(run, timer);
        }
    }
    
    run();
}

// Notification Functions
function showMessage(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">&times;</button>
        </div>
    `;

    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1001;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .notification-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .notification-warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
            .notification-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            .notification-content { display: flex; justify-content: space-between; align-items: center; }
            .notification-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: inherit; }
            @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize Google Maps (for Nearby Recyclers)
function initMap() {
    // Default location (can be updated based on user location)
    const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi coordinates
    
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation
    });

    // Sample recycler locations
    const recyclers = [
        { lat: 28.6139, lng: 77.2090, name: "Green Recyclers Ltd", type: "All Types" },
        { lat: 28.6289, lng: 77.2165, name: "E-Waste Solutions", type: "Electronics" },
        { lat: 28.5989, lng: 77.1956, name: "Paper Recycling Co", type: "Paper & Cardboard" },
        { lat: 28.6342, lng: 77.2224, name: "Plastic Revival", type: "Plastic Items" },
        { lat: 28.5845, lng: 77.2012, name: "Metal Recovery Center", type: "Metal & Cans" }
    ];

    recyclers.forEach(recycler => {
        const marker = new google.maps.Marker({
            position: { lat: recycler.lat, lng: recycler.lng },
            map: map,
            title: recycler.name
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h4>${recycler.name}</h4>
                    <p><strong>Specializes in:</strong> ${recycler.type}</p>
                    <button onclick="getDirections(${recycler.lat}, ${recycler.lng})" 
                            style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                        Get Directions
                    </button>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}

function getDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateCertificate() {
    // Simulate certificate generation
    showMessage('🏆 Certificate generated! Check your downloads folder.', 'success');
    
    // In a real application, this would generate a PDF certificate
    // For demo purposes, we'll just show a success message
    setTimeout(() => {
        const certificate = {
            recipient: 'Eco Warrior',
            points: '150 Green Points',
            impact: '25kg waste recycled',
            date: formatDate(new Date())
        };
        
        console.log('Certificate Data:', certificate);
    }, 1000);
}

// Rewards Functions
function redeemReward(rewardType, pointsCost) {
    // Simulate points check
    const currentPoints = 150; // This would come from user session/database
    
    if (currentPoints >= pointsCost) {
        showMessage(`🎉 Reward redeemed successfully! ${pointsCost} points deducted.`, 'success');
        
        // Update points display if element exists
        const pointsElement = document.getElementById('user-points');
        if (pointsElement) {
            const newPoints = currentPoints - pointsCost;
            animateNumber(pointsElement, currentPoints, newPoints, 500);
        }
    } else {
        showMessage(`⚠️ Insufficient points. You need ${pointsCost - currentPoints} more points.`, 'warning');
    }
}

// Enhanced search functionality for waste guide
function setupWasteSearch() {
    const searchInput = document.getElementById('waste-item');
    if (!searchInput) return;

    const suggestions = [
        'plastic bottle', 'battery', 'newspaper', 'banana peel', 'glass bottle',
        'cardboard', 'aluminum can', 'food waste', 'mobile phone', 'styrofoam',
        'paper', 'electronics', 'organic waste', 'metal', 'cloth'
    ];

    // Add datalist for autocomplete
    const datalist = document.createElement('datalist');
    datalist.id = 'waste-suggestions';
    suggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
    
    searchInput.setAttribute('list', 'waste-suggestions');
    searchInput.parentNode.appendChild(datalist);
}

// Initialize functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication state
    checkAuthenticationStatus();
    
    // Initialize impact display if on track impact page
    if (document.getElementById('total-waste') || document.getElementById('waste-amount')) {
        updateImpactDisplayEnhanced();
    }
    
    // Setup waste search autocomplete
    setupWasteSearch();
    
    // Setup user dropdown
    setupUserDropdown();
    
    // Add enter key support for forms
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.id === 'waste-item') {
                checkWaste();
            }
        }
    });
});

// Authentication Functions
async function checkAuthenticationStatus() {
    try {
        const response = await fetch('/get-user-stats');
        const data = await response.json();
        
        const loggedOutSection = document.getElementById('authLoggedOut');
        const loggedInSection = document.getElementById('authLoggedIn');
        
        if (data.authenticated) {
            // User is logged in
            loggedOutSection.style.display = 'none';
            loggedInSection.style.display = 'block';
            
            // Update user info
            document.getElementById('userName').textContent = data.user.name;
            document.getElementById('userPoints').textContent = data.user.points;
            
            // Update dashboard if on track impact page
            if (window.location.pathname === '/track-impact') {
                updateDashboardWithUserData(data);
            }
        } else {
            // User is not logged in
            loggedOutSection.style.display = 'flex';
            loggedInSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
        // Show logged out state by default
        document.getElementById('authLoggedOut').style.display = 'flex';
        document.getElementById('authLoggedIn').style.display = 'none';
    }
}

function setupUserDropdown() {
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
}

function updateDashboardWithUserData(data) {
    // Update stats on track impact page
    if (document.getElementById('total-waste')) {
        document.getElementById('total-waste').textContent = `${data.user.total_waste} kg`;
    }
    
    if (document.getElementById('points-earned')) {
        document.getElementById('points-earned').textContent = data.user.points;
    }
    
    if (document.getElementById('trees-saved')) {
        document.getElementById('trees-saved').textContent = data.stats.trees_saved;
    }
    
    if (document.getElementById('water-saved')) {
        document.getElementById('water-saved').textContent = `${data.stats.water_saved} L`;
    }
    
    if (document.getElementById('co2-reduced')) {
        document.getElementById('co2-reduced').textContent = `${data.stats.co2_reduced} kg`;
    }
    
    // Update recent activities
    const recentActivities = document.getElementById('recent-activities');
    if (recentActivities && data.recent_pickups) {
        const activitiesHTML = data.recent_pickups.map(pickup => `
            <div class="activity-item">
                <div class="activity-icon">♻️</div>
                <div class="activity-details">
                    <strong>${pickup.type}</strong>
                    <span>${pickup.quantity} - ${pickup.status}</span>
                    <small>${new Date(pickup.date).toLocaleDateString()}</small>
                </div>
            </div>
        `).join('');
        
        recentActivities.innerHTML = activitiesHTML || '<p>No recent activities</p>';
    }
    
    // Show personalized welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `
            <h2>Welcome back, ${data.user.name}! 🌟</h2>
            <p>You're making a real difference for our planet!</p>
        `;
    }
}

// Enhanced impact tracking for logged-in users
async function updateImpactDisplayEnhanced() {
    try {
        const response = await fetch('/get-user-stats');
        const data = await response.json();
        
        if (data.authenticated) {
            updateDashboardWithUserData(data);
            // Hide login prompt
            const loginPrompt = document.getElementById('loginPrompt');
            if (loginPrompt) {
                loginPrompt.style.display = 'none';
            }
        } else {
            // Show demo data for non-logged in users
            updateImpactDisplay();
            // Show login prompt
            const loginPrompt = document.getElementById('loginPrompt');
            if (loginPrompt) {
                loginPrompt.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error updating impact display:', error);
        updateImpactDisplay(); // Fallback to demo data
        // Show login prompt on error
        const loginPrompt = document.getElementById('loginPrompt');
        if (loginPrompt) {
            loginPrompt.style.display = 'block';
        }
    }
}
