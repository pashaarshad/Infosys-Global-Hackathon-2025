// Global Variables
let currentUser = null;
let userPoints = 0;
let userImpact = {
    wasteRecycled: 0,
    treesSaved: 0,
    waterSaved: 0,
    co2Saved: 0
};

// Waste Type Database
const wasteDatabase = {
    plastic: {
        recyclable: true,
        category: 'Plastic',
        icon: '♻️',
        description: 'This plastic item can be recycled into new products.',
        tips: [
            'Clean the item before recycling',
            'Remove labels if possible',
            'Check recycling number on bottom',
            'Drop at nearest recycling center'
        ],
        points: 5
    },
    paper: {
        recyclable: true,
        category: 'Paper',
        icon: '📄',
        description: 'Paper products can be recycled multiple times.',
        tips: [
            'Remove plastic wrapping',
            'Keep paper dry and clean',
            'Staples are okay to leave',
            'Separate different paper types'
        ],
        points: 3
    },
    ewaste: {
        recyclable: true,
        category: 'E-Waste',
        icon: '💻',
        description: 'Electronic waste contains valuable materials that can be recovered.',
        tips: [
            'Remove batteries separately',
            'Delete personal data first',
            'Take to certified e-waste centers',
            'Never throw in regular trash'
        ],
        points: 15
    },
    food: {
        recyclable: false,
        category: 'Organic Waste',
        icon: '🍎',
        description: 'Food waste should be composted, not recycled.',
        tips: [
            'Create a compost bin',
            'Use for organic fertilizer',
            'Separate from other waste',
            'Consider vermiculture'
        ],
        points: 0
    },
    glass: {
        recyclable: true,
        category: 'Glass',
        icon: '🍶',
        description: 'Glass can be recycled infinitely without quality loss.',
        tips: [
            'Rinse thoroughly',
            'Remove caps and lids',
            'Separate by color if required',
            'Handle with care'
        ],
        points: 2
    },
    metal: {
        recyclable: true,
        category: 'Metal',
        icon: '🥫',
        description: 'Metal containers have high recycling value.',
        tips: [
            'Clean thoroughly',
            'Remove labels if required',
            'Separate aluminum from steel',
            'Check with local recycler'
        ],
        points: 20
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
    animateCounters();
});

// Initialize Application
function initializeApp() {
    // Set minimum date for pickup to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('pickup-date');
    if (dateInput) {
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
    
    // Initialize smooth scrolling
    setupSmoothScrolling();
    
    // Initialize navbar scroll effect
    setupNavbarScroll();
    
    // Load user session if exists
    checkUserSession();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Forms
    const pickupForm = document.getElementById('pickup-form');
    if (pickupForm) {
        pickupForm.addEventListener('submit', handlePickupSubmission);
    }
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Modal
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeModal();
            }
        });
    }
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Smooth Scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 140;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar Scroll Effect
function setupNavbarScroll() {
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    
    if (href === '#login') {
        if (currentUser) {
            handleLogout();
        } else {
            openModal();
        }
        return;
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    this.classList.add('active');
    
    // Scroll to section
    const target = document.querySelector(href);
    if (target) {
        scrollToSection(href.substring(1));
    }
}

// Scroll to Section
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        const headerOffset = 140;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Waste Type Checker
function checkWasteType() {
    const searchInput = document.getElementById('waste-search');
    const dropdown = document.getElementById('waste-dropdown');
    const resultDiv = document.getElementById('waste-result');
    
    let wasteType = dropdown.value || searchInput.value.toLowerCase();
    
    // Simple keyword matching
    if (wasteType.includes('bottle') || wasteType.includes('plastic')) {
        wasteType = 'plastic';
    } else if (wasteType.includes('paper') || wasteType.includes('cardboard')) {
        wasteType = 'paper';
    } else if (wasteType.includes('battery') || wasteType.includes('phone') || wasteType.includes('computer')) {
        wasteType = 'ewaste';
    } else if (wasteType.includes('food') || wasteType.includes('organic')) {
        wasteType = 'food';
    } else if (wasteType.includes('glass') || wasteType.includes('jar')) {
        wasteType = 'glass';
    } else if (wasteType.includes('can') || wasteType.includes('metal')) {
        wasteType = 'metal';
    }
    
    const wasteInfo = wasteDatabase[wasteType];
    
    if (wasteInfo) {
        displayWasteResult(wasteInfo);
    } else {
        displayUnknownWasteResult();
    }
    
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Display Waste Result
function displayWasteResult(wasteInfo) {
    const resultDiv = document.getElementById('waste-result');
    const icon = document.querySelector('.result-icon');
    const title = document.querySelector('.result-title');
    const description = document.querySelector('.result-description');
    const tips = document.querySelector('.result-tips');
    
    icon.textContent = wasteInfo.icon;
    
    if (wasteInfo.recyclable) {
        title.textContent = `✅ ${wasteInfo.category} - Recyclable!`;
        title.style.color = '#34A853';
    } else {
        title.textContent = `❌ ${wasteInfo.category} - Not Recyclable`;
        title.style.color = '#EA4335';
    }
    
    description.textContent = wasteInfo.description;
    
    tips.innerHTML = `
        <h4>💡 Tips:</h4>
        <ul>
            ${wasteInfo.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
        ${wasteInfo.recyclable ? `<p><strong>Earn ${wasteInfo.points} points per kg!</strong></p>` : ''}
    `;
}

// Display Unknown Waste Result
function displayUnknownWasteResult() {
    const resultDiv = document.getElementById('waste-result');
    const icon = document.querySelector('.result-icon');
    const title = document.querySelector('.result-title');
    const description = document.querySelector('.result-description');
    const tips = document.querySelector('.result-tips');
    
    icon.textContent = '❓';
    title.textContent = 'Unknown Waste Type';
    title.style.color = '#FF9500';
    description.textContent = 'We couldn\'t identify this waste type. Please contact us for more information.';
    tips.innerHTML = `
        <h4>💡 General Tips:</h4>
        <ul>
            <li>When in doubt, don't recycle</li>
            <li>Contact local waste management</li>
            <li>Check manufacturer guidelines</li>
            <li>Use our contact form for help</li>
        </ul>
    `;
}

// Handle Pickup Submission
function handlePickupSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const pickupData = {
        name: document.getElementById('pickup-name').value,
        phone: document.getElementById('pickup-phone').value,
        address: document.getElementById('pickup-address').value,
        wasteType: document.getElementById('waste-type').value,
        quantity: document.getElementById('waste-quantity').value,
        date: document.getElementById('pickup-date').value
    };
    
    // Simulate API call
    setTimeout(() => {
        document.getElementById('pickup-form').style.display = 'none';
        document.getElementById('pickup-success').classList.remove('hidden');
        
        // Add points to user account
        const wasteType = pickupData.wasteType;
        const quantity = parseInt(pickupData.quantity);
        let points = 0;
        
        switch(wasteType) {
            case 'plastic': points = quantity * 5; break;
            case 'paper': points = quantity * 3; break;
            case 'ewaste': points = quantity * 15; break;
            case 'metal': points = quantity * 20; break;
            case 'glass': points = quantity * 2; break;
        }
        
        if (currentUser) {
            userPoints += points;
            updateUserImpact(quantity, wasteType);
            updatePointsDisplay();
            updateImpactDisplay();
            saveUserData();
        }
        
        // Send to backend
        sendPickupRequest(pickupData);
        
    }, 1000);
}

// Send Pickup Request to Backend
async function sendPickupRequest(pickupData) {
    try {
        const response = await fetch('/api/pickup-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pickupData)
        });
        
        if (response.ok) {
            console.log('Pickup request sent successfully');
        }
    } catch (error) {
        console.error('Error sending pickup request:', error);
    }
}

// Handle Contact Submission
function handleContactSubmission(e) {
    e.preventDefault();
    
    const contactData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
    };
    
    // Simulate API call
    setTimeout(() => {
        alert('Thank you for your message! We\'ll get back to you soon.');
        e.target.reset();
        
        // Send to backend
        sendContactMessage(contactData);
    }, 500);
}

// Send Contact Message to Backend
async function sendContactMessage(contactData) {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        if (response.ok) {
            console.log('Contact message sent successfully');
        }
    } catch (error) {
        console.error('Error sending contact message:', error);
    }
}

// Modal Functions
function openModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            updateAuthUI();
            closeModal();
            loadUserData();
            showNotification('Login successful! Welcome back, ' + currentUser.name, 'success');
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        phone: document.getElementById('register-phone').value
    };
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            updateAuthUI();
            closeModal();
            initializeUserData();
            showNotification('Registration successful! Welcome, ' + currentUser.name, 'success');
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    userPoints = 0;
    userImpact = {
        wasteRecycled: 0,
        treesSaved: 0,
        waterSaved: 0,
        co2Saved: 0
    };
    
    updateAuthUI();
    updatePointsDisplay();
    updateImpactDisplay();
    localStorage.removeItem('smartrecycle_user');
    showNotification('Logged out successfully', 'info');
}

function updateAuthUI() {
    const authText = document.getElementById('auth-text');
    if (currentUser) {
        authText.textContent = currentUser.name;
    } else {
        authText.textContent = 'Login';
    }
}

// Check User Session
function checkUserSession() {
    const savedUser = localStorage.getItem('smartrecycle_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
        loadUserData();
    }
}

// User Data Management
function loadUserData() {
    if (currentUser) {
        const savedData = localStorage.getItem('smartrecycle_data_' + currentUser.id);
        if (savedData) {
            const data = JSON.parse(savedData);
            userPoints = data.points || 0;
            userImpact = data.impact || userImpact;
        }
        updatePointsDisplay();
        updateImpactDisplay();
    }
}

function saveUserData() {
    if (currentUser) {
        const userData = {
            points: userPoints,
            impact: userImpact
        };
        localStorage.setItem('smartrecycle_data_' + currentUser.id, JSON.stringify(userData));
        localStorage.setItem('smartrecycle_user', JSON.stringify(currentUser));
    }
}

function initializeUserData() {
    userPoints = 0;
    userImpact = {
        wasteRecycled: 0,
        treesSaved: 0,
        waterSaved: 0,
        co2Saved: 0
    };
    updatePointsDisplay();
    updateImpactDisplay();
    saveUserData();
}

// Update User Impact
function updateUserImpact(quantity, wasteType) {
    userImpact.wasteRecycled += quantity;
    
    // Calculate environmental impact
    switch(wasteType) {
        case 'plastic':
            userImpact.treesSaved += Math.floor(quantity * 0.5);
            userImpact.waterSaved += quantity * 10;
            userImpact.co2Saved += quantity * 2;
            break;
        case 'paper':
            userImpact.treesSaved += Math.floor(quantity * 0.3);
            userImpact.waterSaved += quantity * 15;
            userImpact.co2Saved += quantity * 1.5;
            break;
        case 'ewaste':
            userImpact.treesSaved += Math.floor(quantity * 2);
            userImpact.waterSaved += quantity * 50;
            userImpact.co2Saved += quantity * 10;
            break;
        case 'metal':
            userImpact.treesSaved += Math.floor(quantity * 1);
            userImpact.waterSaved += quantity * 20;
            userImpact.co2Saved += quantity * 5;
            break;
        case 'glass':
            userImpact.treesSaved += Math.floor(quantity * 0.2);
            userImpact.waterSaved += quantity * 5;
            userImpact.co2Saved += quantity * 1;
            break;
    }
}

// Update Displays
function updatePointsDisplay() {
    const pointsElement = document.getElementById('user-points');
    if (pointsElement) {
        pointsElement.textContent = userPoints;
    }
}

function updateImpactDisplay() {
    const wasteElement = document.getElementById('waste-recycled');
    const treesElement = document.getElementById('trees-saved');
    const waterElement = document.getElementById('water-saved');
    const co2Element = document.getElementById('co2-saved');
    
    if (wasteElement) wasteElement.textContent = userImpact.wasteRecycled + ' kg';
    if (treesElement) treesElement.textContent = userImpact.treesSaved;
    if (waterElement) waterElement.textContent = userImpact.waterSaved + ' L';
    if (co2Element) co2Element.textContent = userImpact.co2Saved + ' kg';
}

// Animate Counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-card h3');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
                let current = 0;
                const increment = target / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = counter.textContent.replace(/\d+/, target);
                        clearInterval(timer);
                    } else {
                        counter.textContent = counter.textContent.replace(/\d+/, Math.floor(current));
                    }
                }, 20);
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

// Rewards Functions
function redeemReward(rewardType, pointsRequired) {
    if (!currentUser) {
        showNotification('Please login to redeem rewards', 'warning');
        openModal();
        return;
    }
    
    if (userPoints < pointsRequired) {
        showNotification(`You need ${pointsRequired - userPoints} more points to redeem this reward`, 'warning');
        return;
    }
    
    // Confirm redemption
    if (confirm(`Redeem this reward for ${pointsRequired} points?`)) {
        userPoints -= pointsRequired;
        updatePointsDisplay();
        saveUserData();
        
        showNotification(`Reward redeemed successfully! Check your email for details.`, 'success');
        
        // Send redemption to backend
        sendRedemption(rewardType, pointsRequired);
    }
}

async function sendRedemption(rewardType, pointsRequired) {
    try {
        const response = await fetch('/api/redeem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                rewardType,
                points: pointsRequired
            })
        });
        
        if (response.ok) {
            console.log('Redemption processed successfully');
        }
    } catch (error) {
        console.error('Error processing redemption:', error);
    }
}

// Find Recyclers
function findRecyclers() {
    const location = document.getElementById('location-search').value;
    const filter = document.getElementById('recycler-filter').value;
    
    // Simulate search - in real app, this would call Google Maps API
    showNotification(`Searching for recyclers near "${location}"...`, 'info');
    
    // You could integrate with Google Maps API here
    // For demo purposes, we'll just show existing results
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                animation: slideIn 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .notification-success {
                background: linear-gradient(135deg, #34A853, #4285F4);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #EA4335, #FF6B6B);
            }
            
            .notification-warning {
                background: linear-gradient(135deg, #FF9500, #FFB84D);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #4285F4, #34A853);
            }
            
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideIn {
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
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Add loading states for better UX
function showLoading(element) {
    const originalText = element.textContent;
    element.textContent = 'Loading...';
    element.disabled = true;
    
    return () => {
        element.textContent = originalText;
        element.disabled = false;
    };
}

// Intersection Observer for animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.stat-card, .impact-card, .reward-card, .feature-card, .team-member').forEach(el => {
        observer.observe(el);
    });
};

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', observeElements);

// Export functions for global access
window.scrollToSection = scrollToSection;
window.checkWasteType = checkWasteType;
window.closeModal = closeModal;
window.showTab = showTab;
window.redeemReward = redeemReward;
window.findRecyclers = findRecyclers;
