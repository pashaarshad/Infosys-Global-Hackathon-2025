// SmartRecycle - Enhanced Premium JavaScript Experience

// Global app state
const SmartRecycleApp = {
    isAuthenticated: false,
    userData: null,
    currentTheme: 'light',
    animations: {
        observers: [],
        initialized: false
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main app initialization
function initializeApp() {
    console.log('🚀 SmartRecycle App Initializing...');
    
    // Core functionality
    setupMobileNavigation();
    setupScrollEffects();
    setupAnimations();
    setupFormEnhancements();
    setupInteractiveElements();
    
    // Authentication
    checkAuthenticationStatus();
    setupUserDropdown();
    
    // Page-specific features
    initializePageFeatures();
    
    // Performance optimizations
    setupLazyLoading();
    setupPreloading();
    
    console.log('✅ SmartRecycle App Initialized');
}

// Enhanced Mobile Navigation with smooth animations
function setupMobileNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.querySelector('.navbar');

    if (!hamburger || !navMenu) return;

    // Hamburger click handler
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Close menu when clicking on links
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    function toggleMobileMenu() {
        const isActive = hamburger.classList.contains('active');
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate menu items
        const menuItems = navMenu.querySelectorAll('.nav-link');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Enhanced scroll effects with performance optimization
function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    // Throttled scroll handler for better performance
    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class for navbar styling
        if (currentScrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll direction change
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar?.style.setProperty('transform', 'translateY(-100%)');
        } else {
            navbar?.style.setProperty('transform', 'translateY(0)');
        }

        lastScrollY = currentScrollY;
    }

    // Use requestAnimationFrame for smooth scrolling
    function throttledScroll() {
        if (scrollTimeout) return;
        
        scrollTimeout = requestAnimationFrame(() => {
            handleScroll();
            scrollTimeout = null;
        });
    }

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
        
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
    
    if (!itemInput || !itemInput.value.trim()) {
        showMessage('Please enter a waste item to check', 'warning');
        return;
    }

    const item = itemInput.value.trim();
    
    // Show loading state
    const submitBtn = document.querySelector('.scanner-btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
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
            submitBtn.innerHTML = '<i class="fas fa-search"></i>';
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
        actionMessage = '<div style="margin-top: 1rem;"><a href="/request-pickup" class="btn btn-primary">📞 Request Pickup</a></div>';
    } else if (data.recyclable === false) {
        resultClass = 'result-non-recyclable';
        statusText = 'Not Recyclable ❌';
        actionMessage = '<div style="margin-top: 1rem; color: #666;"><em>Consider reducing use of this item in the future</em></div>';
    }

    container.innerHTML = `
        <div class="result-card ${resultClass} show">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${data.emoji}</div>
            <h3>${data.item}</h3>
            <div style="font-size: 1.2rem; margin: 1rem 0;">
                <strong>${statusText}</strong>
            </div>
            <div style="display: inline-block; padding: 0.5rem 1rem; background-color: ${data.color}; color: white; border-radius: 20px; margin: 1rem 0;">
                ${data.category}
            </div>
            <p style="font-style: italic; margin-top: 1rem;">💡 ${data.tip}</p>
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

function createCelebrationEffect() {
    // Simple celebration effect
    const celebration = document.createElement('div');
    celebration.innerHTML = '🎉';
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        font-size: 4rem;
        z-index: 1000;
        animation: celebrationBounce 1s ease-out;
        pointer-events: none;
    `;
    
    document.body.appendChild(celebration);
    setTimeout(() => celebration.remove(), 1000);
}

// Quick check function for waste guide
function quickCheck(item) {
    const itemInput = document.getElementById('waste-item');
    if (itemInput) {
        itemInput.value = item;
        checkWaste();
    }
}

// Enhanced Pickup Request Functions
function submitPickupRequest() {
    const form = document.getElementById('pickup-form');
    const submitBtn = document.querySelector('.btn-step');
    
    if (!form) {
        showMessage('Form not found', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    const data = {
        name: formData.get('name') || '',
        address: formData.get('address') || '',
        contact: formData.get('contact') || '',
        waste_type: formData.get('waste_type') || '',
        quantity: formData.get('estimated_weight') || '',
        pickup_time: formData.get('pickup_time') || '',
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

// Advanced animation system with Intersection Observer
function setupAnimations() {
    if (SmartRecycleApp.animations.initialized) return;

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.animate || 'fadeIn';
                
                element.classList.add('animate', animationType);
                
                // Stagger animations for grid items
                if (element.classList.contains('card')) {
                    const delay = Array.from(element.parentNode.children).indexOf(element) * 100;
                    element.style.animationDelay = `${delay}ms`;
                }
                
                animateOnScroll.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('.card, .hero-content, .section h2, .form-container');
    animatableElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        animateOnScroll.observe(el);
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            animation-duration: 0.8s;
            animation-fill-mode: both;
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate.fadeIn {
            animation-name: fadeInUp;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    SmartRecycleApp.animations.initialized = true;
}

// Enhanced form functionality
function setupFormEnhancements() {
    // Real-time form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const isRequired = field.hasAttribute('required');
    
    clearFieldError(field);
    
    // Required field validation
    if (isRequired && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (fieldType === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // Password validation
    if (fieldType === 'password' && value) {
        if (value.length < 6) {
            showFieldError(field, 'Password must be at least 6 characters');
            return false;
        }
    }
    
    showFieldSuccess(field);
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = '#F44336';
    
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.color = '#F44336';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.opacity = '1';
}

function showFieldSuccess(field) {
    field.style.borderColor = 'var(--secondary-green)';
}

function clearFieldError(field) {
    field.style.borderColor = '';
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.style.opacity = '0';
        setTimeout(() => errorElement.remove(), 300);
    }
}

// Interactive elements with hover effects
function setupInteractiveElements() {
    // Enhanced button interactions
    document.querySelectorAll('.cta-button, .form-button, .nav-link').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Enhanced authentication system
async function checkAuthenticationStatus() {
    try {
        const response = await fetch('/get-user-stats');
        const data = await response.json();
        
        SmartRecycleApp.isAuthenticated = data.authenticated;
        SmartRecycleApp.userData = data.user || null;
        
        updateAuthenticationUI(data);
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        updateAuthenticationUI({ authenticated: false });
    }
}

function updateAuthenticationUI(data) {
    const loggedOutSection = document.getElementById('authLoggedOut');
    const loggedInSection = document.getElementById('authLoggedIn');
    const userName = document.getElementById('userName');
    const userPoints = document.getElementById('userPoints');
    
    if (!loggedOutSection || !loggedInSection) return;
    
    if (data.authenticated && data.user) {
        loggedOutSection.style.display = 'none';
        loggedInSection.style.display = 'block';
        
        if (userName) userName.textContent = data.user.name;
        if (userPoints) userPoints.textContent = data.user.points || 0;
        
        // Update dashboard if on track-impact page
        if (window.location.pathname === '/track-impact') {
            updateDashboard(data);
        }
    } else {
        loggedOutSection.style.display = 'block';
        loggedInSection.style.display = 'none';
    }
}

function setupUserDropdown() {
    const userBtn = document.getElementById('userBtn');
    const dropdown = document.querySelector('.user-dropdown');
    
    if (!userBtn || !dropdown) return;
    
    userBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

// Enhanced message system
function showMessage(message, type = 'info', duration = 5000) {
    const messagePopup = document.createElement('div');
    messagePopup.className = `message-popup ${type}`;
    messagePopup.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getIconForType(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; margin-left: auto; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(messagePopup);
    
    // Trigger animation
    requestAnimationFrame(() => {
        messagePopup.classList.add('show');
    });
    
    // Auto remove
    setTimeout(() => {
        messagePopup.classList.remove('show');
        setTimeout(() => messagePopup.remove(), 300);
    }, duration);
}

function getIconForType(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Page-specific features
function initializePageFeatures() {
    const pathname = window.location.pathname;
    
    switch (pathname) {
        case '/':
        case '/home':
            initializeHomePage();
            break;
        case '/waste-guide':
            initializeWasteGuide();
            break;
        case '/track-impact':
            initializeTrackImpact();
            break;
    }
}

function initializeHomePage() {
    // Add typing animation to hero text
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let index = 0;
        function typeText() {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                setTimeout(typeText, 100);
            }
        }
        
        setTimeout(typeText, 500);
    }
}

function initializeWasteGuide() {
    // Add waste item search functionality
    const wasteForm = document.getElementById('waste-form');
    if (wasteForm) {
        wasteForm.addEventListener('submit', handleWasteCheck);
    }
}

async function handleWasteCheck(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const item = formData.get('item');
    
    if (!item) {
        showMessage('Please enter an item to check', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/check-waste', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item })
        });
        
        const result = await response.json();
        displayWasteResult(result);
        
    } catch (error) {
        console.error('Waste check error:', error);
        showMessage('Error checking item. Please try again.', 'error');
    }
}

function displayWasteResult(result) {
    const resultContainer = document.getElementById('waste-result');
    if (!resultContainer) return;
    
    const isRecyclable = result.recyclable;
    const statusText = isRecyclable ? 'Recyclable' : 'Not Recyclable';
    const statusColor = isRecyclable ? 'var(--secondary-green)' : '#F44336';
    
    resultContainer.innerHTML = `
        <div class="waste-result-card fade-in" style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: var(--shadow-lg); margin-top: 2rem;">
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${result.emoji}</div>
                <h3>${result.item}</h3>
                <div style="display: inline-block; padding: 0.5rem 1rem; background: ${statusColor}; color: white; border-radius: 2rem; margin: 1rem 0;">
                    ${statusText}
                </div>
                <p><strong>Category:</strong> ${result.category}</p>
                <div style="background: var(--light-green); padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                    <strong>💡 Tip:</strong> ${result.tip}
                </div>
            </div>
        </div>
    `;
    
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

function initializeTrackImpact() {
    updateDashboard();
}

function updateDashboard(data) {
    if (!data) return;
    
    // Update stats if elements exist
    const statsElements = {
        'trees-saved': data.stats?.trees_saved,
        'water-saved': data.stats?.water_saved,
        'co2-reduced': data.stats?.co2_reduced,
        'pickup-count': data.stats?.pickup_count
    };
    
    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            animateNumber(element, 0, value, 2000);
        }
    });
}

function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// Performance optimizations
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

function setupPreloading() {
    // Preload critical resources
    const criticalResources = [
        '/static/css/style.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'style';
        document.head.appendChild(link);
    });
}

// Export functions for global access
window.SmartRecycle = {
    showMessage,
    checkAuthenticationStatus,
    handleWasteCheck,
    validateField
};

// Add missing celebration animation CSS
const celebrationStyles = document.createElement('style');
celebrationStyles.textContent = `
@keyframes celebrationBounce {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1) translateY(-100px); opacity: 0; }
}

.hidden { display: none !important; }

.result-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    margin: 2rem 0;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.4s ease;
}

.result-card.show {
    opacity: 1;
    transform: translateY(0);
}

.result-card.result-recyclable {
    border: 3px solid #4CAF50;
    background: linear-gradient(135deg, #E8F5E8, #F1F8E9);
}

.result-card.result-non-recyclable {
    border: 3px solid #F44336;
    background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
}

.result-card.result-unknown {
    border: 3px solid #9E9E9E;
    background: linear-gradient(135deg, #F5F5F5, #EEEEEE);
}
`;
document.head.appendChild(celebrationStyles);
