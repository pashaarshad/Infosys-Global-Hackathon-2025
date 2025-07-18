// SmartRecycle - Enhanced Premium JavaScript Experience

// Global app state
const SmartRecycleApp = {
    isAuthenticated: false,
    userData: null,
    currentTheme: 'light',
    animations: {
        observers: [],
        initialized: false
    },
    notifications: {
        queue: [],
        maxNotifications: 3,
        duration: 5000
    }
};

// Notification System
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.notifications = new Map();
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        const id = Date.now().toString();
        
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: linear-gradient(135deg, ${this.getTypeColor(type)});
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            pointer-events: auto;
            cursor: pointer;
            transform: translateX(420px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.4;
            position: relative;
            overflow: hidden;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 20px;">${this.getTypeIcon(type)}</div>
                <div style="flex: 1;">${message}</div>
                <div style="opacity: 0.7; font-size: 18px; cursor: pointer;" onclick="notificationSystem.hide('${id}')">×</div>
            </div>
        `;

        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255,255,255,0.3);
            animation: notificationProgress ${duration}ms linear;
            transform-origin: left;
        `;
        notification.appendChild(progressBar);

        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto hide
        setTimeout(() => this.hide(id), duration);

        // Click to dismiss
        notification.addEventListener('click', () => this.hide(id));

        return id;
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.style.transform = 'translateX(420px)';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 400);
        }
    }

    getTypeColor(type) {
        const colors = {
            'success': '#10b981, #059669',
            'error': '#ef4444, #dc2626',
            'warning': '#f59e0b, #d97706',
            'info': '#3b82f6, #2563eb'
        };
        return colors[type] || colors.info;
    }

    getTypeIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Add notification progress bar animation to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes notificationProgress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
    }
    
    .notification:hover {
        transform: translateX(-10px) !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important;
    }
`;
document.head.appendChild(notificationStyles);

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
            // Add floating label effect
            if (input.type !== 'checkbox' && input.type !== 'radio') {
                setupFloatingLabel(input);
            }
            
            // Real-time validation
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });

    // Enhanced submit handlers
    document.querySelectorAll('[data-form-type]').forEach(form => {
        const formType = form.dataset.formType;
        form.addEventListener('submit', (e) => handleFormSubmit(e, formType));
    });
}

function setupFloatingLabel(input) {
}

function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple 0.6s ease-out';
    
    // Add ripple styles if not already added
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .cta-button, .form-button {
                position: relative;
                overflow: hidden;
            }
            
            @keyframes ripple {
                from {
                    transform: scale(0);
                    opacity: 1;
                }
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
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

// Form submission handlers
async function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate form
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showMessage('Please correct the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        const endpoint = getEndpointForFormType(formType);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            
            if (result.redirect) {
                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1500);
            } else {
                form.reset();
            }
        } else {
            showMessage(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function getEndpointForFormType(formType) {
    const endpoints = {
        'register': '/auth/register',
        'login': '/auth/login',
        'contact': '/submit-contact',
        'pickup': '/submit-pickup'
    };
    return endpoints[formType] || '/';
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

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
