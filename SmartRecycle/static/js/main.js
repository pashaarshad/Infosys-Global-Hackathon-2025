// SmartRecycle - Enhanced Main JavaScript File

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

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Initialize authentication state
    checkAuthenticationStatus();
    
    // Setup user dropdown
    setupUserDropdown();
    
    // Add fade-in animation to cards
    animateCards();
});

// Enhanced Authentication Functions
async function checkAuthenticationStatus() {
    try {
        const response = await fetch('/get-user-stats');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        const loggedOutSection = document.getElementById('authLoggedOut');
        const loggedInSection = document.getElementById('authLoggedIn');
        
        if (data.authenticated && data.user) {
            // User is logged in
            if (loggedOutSection) loggedOutSection.style.display = 'none';
            if (loggedInSection) loggedInSection.style.display = 'block';
            
            // Update user info
            const userName = document.getElementById('userName');
            const userPoints = document.getElementById('userPoints');
            
            if (userName) userName.textContent = data.user.name;
            if (userPoints) userPoints.textContent = data.user.points;
            
            // Update dashboard if on track impact page
            if (window.location.pathname === '/track-impact') {
                updateDashboardWithUserData(data);
            }
        } else {
            // User is not logged in
            if (loggedOutSection) loggedOutSection.style.display = 'flex';
            if (loggedInSection) loggedInSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking authentication status:', error);
        // Show logged out state by default
        const loggedOutSection = document.getElementById('authLoggedOut');
        const loggedInSection = document.getElementById('authLoggedIn');
        
        if (loggedOutSection) loggedOutSection.style.display = 'flex';
        if (loggedInSection) loggedInSection.style.display = 'none';
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

// Enhanced Waste Guide Functions
function checkWaste() {
    const itemInput = document.getElementById('waste-item');
    const resultContainer = document.getElementById('result-container');
    const submitBtn = document.querySelector('.form-button');
    
    if (!itemInput || !itemInput.value.trim()) {
        showMessage('Please enter a waste item to check', 'warning');
        return;
    }

    const item = itemInput.value.trim();
    
    // Show loading state
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        submitBtn.disabled = true;
    }
    
    fetch('/check-waste', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: item })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayWasteResult(data, resultContainer);
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error checking waste item. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-search"></i> Check Item';
            submitBtn.disabled = false;
        }
    });
}

function displayWasteResult(data, container) {
    if (!container) return;
    
    let resultClass = 'result-unknown';
    let statusText = 'Unknown ❓';
    let actionMessage = '';
    
    if (data.recyclable === true) {
        resultClass = 'result-recyclable';
        statusText = 'Recyclable ✅';
        actionMessage = '<div style="margin-top: 1rem;"><a href="/request-pickup" class="cta-button">📞 Request Pickup</a></div>';
    } else if (data.recyclable === false) {
        resultClass = 'result-non-recyclable';
        statusText = 'Not Recyclable ❌';
        actionMessage = '<div style="margin-top: 1rem; color: #666;"><em>Consider reducing use of this item in the future</em></div>';
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
            ${actionMessage}
        </div>
    `;
    
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add celebration effect for recyclable items
    if (data.recyclable === true) {
        createCelebrationEffect();
    }
}

// Enhanced Pickup Request Functions
function submitPickupRequest() {
    const form = document.getElementById('pickup-form');
    const submitBtn = document.querySelector('.form-button');
    
    if (!form) return;
    
    const formData = new FormData(form);
    
    const data = {
        name: formData.get('name'),
        address: formData.get('address'),
        contact: formData.get('contact'),
        waste_type: formData.get('waste_type'),
        quantity: formData.get('quantity'),
        pickup_time: formData.get('pickup_time'),
        notes: formData.get('notes') || ''
    };

    // Enhanced validation
    const requiredFields = ['name', 'address', 'contact', 'waste_type', 'quantity', 'pickup_time'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    
    if (missingFields.length > 0) {
        showMessage('Please fill in all required fields', 'warning');
        return;
    }

    // Validate contact number
    const contactRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!contactRegex.test(data.contact)) {
        showMessage('Please enter a valid contact number', 'warning');
        return;
    }

    // Show loading state
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Request...';
        submitBtn.disabled = true;
    }

    fetch('/submit-pickup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        if (result.success) {
            showMessage(result.message, 'success');
            form.reset();
            
            // Show points earned notification
            setTimeout(() => {
                showMessage('🎉 You earned 10 green points for this request!', 'success');
            }, 2000);
            
            // Show success details
            showPickupSuccessDetails();
        } else {
            showMessage(result.message || 'Error submitting request. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error submitting request. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Pickup Request';
            submitBtn.disabled = false;
        }
    });
}

// Enhanced Contact Form Functions
function submitContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.querySelector('.form-button');
    
    if (!form) return;
    
    const formData = new FormData(form);
    
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        subject: formData.get('subject'),
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on'
    };

    // Validation
    if (!data.name || !data.email || !data.subject || !data.message) {
        showMessage('Please fill in all required fields', 'warning');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showMessage('Please enter a valid email address', 'warning');
        return;
    }

    // Show loading state
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Message...';
        submitBtn.disabled = true;
    }

    fetch('/submit-contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        if (result.success) {
            showMessage(result.message, 'success');
            form.reset();
            showContactSuccessDetails();
        } else {
            showMessage(result.message || 'Error sending message. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error sending message. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            submitBtn.disabled = false;
        }
    });
}

// Enhanced Notification Functions
function showMessage(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
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
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1001;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .notification-success { 
                background: linear-gradient(135deg, #d4edda, #c3e6cb); 
                color: #155724; 
                border: 2px solid #4CAF50; 
            }
            .notification-error { 
                background: linear-gradient(135deg, #f8d7da, #f5c6cb); 
                color: #721c24; 
                border: 2px solid #F44336; 
            }
            .notification-warning { 
                background: linear-gradient(135deg, #fff3cd, #ffeaa7); 
                color: #856404; 
                border: 2px solid #FF9800; 
            }
            .notification-info { 
                background: linear-gradient(135deg, #d1ecf1, #bee5eb); 
                color: #0c5460; 
                border: 2px solid #2196F3; 
            }
            .notification-content { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                gap: 1rem;
            }
            .notification-close { 
                background: none; 
                border: none; 
                font-size: 1.5rem; 
                cursor: pointer; 
                color: inherit; 
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            .notification-close:hover {
                opacity: 1;
            }
            @keyframes slideInRight { 
                from { transform: translateX(100%); opacity: 0; } 
                to { transform: translateX(0); opacity: 1; } 
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Enhanced Animation Functions
function animateCards() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

function animateNumber(element, start, end, duration) {
    if (!element) return;
    
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

function createCelebrationEffect() {
    const emojis = ['🎉', '♻️', '🌱', '✨', '🎊'];
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const celebration = document.createElement('div');
            celebration.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            celebration.style.cssText = `
                position: fixed;
                top: ${Math.random() * 100}vh;
                left: ${Math.random() * 100}vw;
                font-size: 2rem;
                pointer-events: none;
                z-index: 1000;
                animation: celebrationFall 3s linear forwards;
            `;
            
            document.body.appendChild(celebration);
            
            setTimeout(() => celebration.remove(), 3000);
        }, i * 200);
    }
}

// Success detail functions
function showPickupSuccessDetails() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-details fade-in';
    successDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #4CAF50, #388E3C); color: white; padding: 2rem; border-radius: 15px; text-align: center; margin: 2rem auto; max-width: 500px;">
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Pickup Request Submitted! ✅</h3>
            <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                <h4>What happens next?</h4>
                <ul style="list-style: none; margin: 0.5rem 0; text-align: left;">
                    <li>📧 Email confirmation sent</li>
                    <li>📞 Confirmation call within 24 hours</li>
                    <li>🚛 Pickup scheduled within 2-3 days</li>
                    <li>🎁 Points credited after collection</li>
                </ul>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: white; color: #2E7D32; border: none; padding: 0.5rem 1rem; border-radius: 5px; margin-top: 1rem; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    successDiv.scrollIntoView({ behavior: 'smooth' });
}

function showContactSuccessDetails() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-details fade-in';
    successDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 2rem; border-radius: 15px; text-align: center; margin: 2rem auto; max-width: 500px;">
            <i class="fas fa-paper-plane" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Message Sent Successfully! 📧</h3>
            <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                <p>Thank you for reaching out! Our team will review your message and get back to you soon.</p>
                <p><strong>Response time:</strong> Within 24 hours</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: white; color: #1976D2; border: none; padding: 0.5rem 1rem; border-radius: 5px; margin-top: 1rem; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    successDiv.scrollIntoView({ behavior: 'smooth' });
}

// Enhanced search functionality for waste guide
function setupWasteSearch() {
    const searchInput = document.getElementById('waste-item');
    if (!searchInput) return;

    const suggestions = [
        'plastic bottle', 'battery', 'newspaper', 'banana peel', 'glass bottle',
        'cardboard', 'aluminum can', 'food waste', 'mobile phone', 'styrofoam',
        'paper', 'electronics', 'organic waste', 'metal', 'cloth', 'tin can',
        'magazine', 'pizza box', 'yogurt container', 'plastic bag'
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

// Quick check function for popular items
function quickCheck(item) {
    const itemInput = document.getElementById('waste-item');
    if (itemInput) {
        itemInput.value = item;
        checkWaste();
    }
}

// Enhanced form validation
function validateField(field) {
    let isValid = true;
    const value = field.value.trim();
    
    // Remove previous validation styling
    field.style.borderColor = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    // Specific validations
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
        }
    }
    
    if (field.type === 'tel' && value) {
        const contactRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        if (!contactRegex.test(value)) {
            isValid = false;
        }
    }
    
    // Apply styling
    if (!isValid && value) {
        field.style.borderColor = '#F44336';
    } else if (value) {
        field.style.borderColor = '#4CAF50';
    }
    
    return isValid;
}

// Initialize enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup waste search autocomplete
    setupWasteSearch();
    
    // Add enter key support for forms
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.id === 'waste-item') {
                e.preventDefault();
                checkWaste();
            }
        }
    });
    
    // Enhanced form validation
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(244, 67, 54)') {
                validateField(this);
            }
        });
    });
});

// Add celebration animation CSS
const celebrationStyles = document.createElement('style');
celebrationStyles.textContent = `
    @keyframes celebrationFall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(celebrationStyles);
