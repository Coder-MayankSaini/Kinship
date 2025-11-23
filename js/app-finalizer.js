// Kinship - Application Finalizer
// Final integration and polishing of all components

class ApplicationFinalizer {
    constructor() {
        this.polishingTasks = [];
        this.transitionEffects = [];
        this.performanceOptimizations = [];
    }

    // Main finalization method
    async finalizeApplication() {
        console.log('🎨 Finalizing Kinship application...');
        
        // Polish UI interactions and transitions
        this.polishUIInteractions();
        
        // Optimize performance
        this.optimizePerformance();
        
        // Enhance accessibility
        this.enhanceAccessibility();
        
        // Add loading states and feedback
        this.addLoadingStates();
        
        // Implement error handling
        this.implementErrorHandling();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
        
        // Optimize for mobile
        this.optimizeForMobile();
        
        console.log('✨ Application finalization complete!');
    }

    // Polish UI interactions and transitions
    polishUIInteractions() {
        console.log('Polishing UI interactions...');
        
        // Add smooth scrolling
        this.addSmoothScrolling();
        
        // Enhance button interactions
        this.enhanceButtonInteractions();
        
        // Add hover effects
        this.addHoverEffects();
        
        // Improve form interactions
        this.improveFormInteractions();
        
        // Add page transitions
        this.addPageTransitions();
    }

    // Add smooth scrolling
    addSmoothScrolling() {
        // Enable smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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

        // Add smooth scrolling to page
        if (CSS.supports('scroll-behavior', 'smooth')) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    // Enhance button interactions
    enhanceButtonInteractions() {
        // Add ripple effect to buttons
        document.querySelectorAll('button, .btn, .btn-primary, .btn-secondary').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add CSS for ripple animation
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Add hover effects
    addHoverEffects() {
        // Add hover effects to cards
        document.querySelectorAll('.item-card, .category-card, .user-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                this.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    // Improve form interactions
    improveFormInteractions() {
        // Add floating labels
        document.querySelectorAll('input, textarea').forEach(input => {
            if (input.type !== 'checkbox' && input.type !== 'radio') {
                this.addFloatingLabel(input);
            }
        });

        // Add real-time validation feedback
        document.querySelectorAll('form').forEach(form => {
            this.addRealTimeValidation(form);
        });
    }

    // Add floating label effect
    addFloatingLabel(input) {
        const wrapper = input.parentElement;
        const label = wrapper.querySelector('label');
        
        if (!label) return;

        const updateLabel = () => {
            if (input.value || input === document.activeElement) {
                label.classList.add('floating');
            } else {
                label.classList.remove('floating');
            }
        };

        input.addEventListener('focus', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('input', updateLabel);
        
        // Initial state
        updateLabel();
    }

    // Add real-time validation
    addRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    this.validateInput(input);
                }
            });
        });
    }

    // Validate individual input
    validateInput(input) {
        const isValid = input.checkValidity();
        
        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
        
        return isValid;
    }

    // Add page transitions
    addPageTransitions() {
        // Add fade-in effect for page content
        const pageContent = document.querySelector('main, .main-content, body');
        if (pageContent) {
            pageContent.style.opacity = '0';
            pageContent.style.transition = 'opacity 0.3s ease-in-out';
            
            setTimeout(() => {
                pageContent.style.opacity = '1';
            }, 50);
        }
    }

    // Optimize performance
    optimizePerformance() {
        console.log('Optimizing performance...');
        
        // Lazy load images
        this.implementLazyLoading();
        
        // Debounce scroll events
        this.debounceScrollEvents();
        
        // Optimize DOM queries
        this.optimizeDOMQueries();
        
        // Add intersection observer for animations
        this.addIntersectionObserver();
    }

    // Implement lazy loading for images
    implementLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    // Debounce scroll events
    debounceScrollEvents() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Trigger scroll-based animations or updates
                this.handleScrollEffects();
            }, 16); // ~60fps
        }, { passive: true });
    }

    // Handle scroll effects
    handleScrollEffects() {
        // Add scroll-to-top button
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let scrollToTopBtn = document.querySelector('.scroll-to-top');
        
        if (scrollTop > 300) {
            if (!scrollToTopBtn) {
                scrollToTopBtn = this.createScrollToTopButton();
            }
            scrollToTopBtn.classList.add('visible');
        } else if (scrollToTopBtn) {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    // Create scroll to top button
    createScrollToTopButton() {
        const button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.innerHTML = '↑';
        button.setAttribute('aria-label', 'Scroll to top');
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #007bff;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        
        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        document.body.appendChild(button);
        
        // Add CSS for visible state
        if (!document.querySelector('#scroll-to-top-styles')) {
            const style = document.createElement('style');
            style.id = 'scroll-to-top-styles';
            style.textContent = `
                .scroll-to-top.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .scroll-to-top:hover {
                    background: #0056b3;
                    transform: translateY(-2px);
                }
            `;
            document.head.appendChild(style);
        }
        
        return button;
    }

    // Add intersection observer for animations
    addIntersectionObserver() {
        const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .item-card');
        
        if ('IntersectionObserver' in window && animatedElements.length > 0) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, { threshold: 0.1 });
            
            animatedElements.forEach(el => animationObserver.observe(el));
        }
    }

    // Enhance accessibility
    enhanceAccessibility() {
        console.log('Enhancing accessibility...');
        
        // Add skip links
        this.addSkipLinks();
        
        // Improve focus management
        this.improveFocusManagement();
        
        // Add ARIA labels where missing
        this.addMissingAriaLabels();
        
        // Enhance keyboard navigation
        this.enhanceKeyboardNavigation();
    }

    // Add skip links
    addSkipLinks() {
        // Skip links functionality removed per user request
    }

    // Improve focus management
    improveFocusManagement() {
        // Add focus indicators
        document.querySelectorAll('button, a, input, textarea, select').forEach(element => {
            element.addEventListener('focus', function() {
                this.classList.add('focused');
            });
            
            element.addEventListener('blur', function() {
                this.classList.remove('focused');
            });
        });
    }

    // Add missing ARIA labels
    addMissingAriaLabels() {
        // Add labels to buttons without text
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('i, svg, .icon');
                if (icon) {
                    button.setAttribute('aria-label', 'Button');
                }
            }
        });
        
        // Add labels to form inputs without labels
        document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
            const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
            if (!label && input.placeholder) {
                input.setAttribute('aria-label', input.placeholder);
            }
        });
    }

    // Enhance keyboard navigation
    enhanceKeyboardNavigation() {
        // Add keyboard support for custom elements
        document.querySelectorAll('[role="button"]:not(button)').forEach(element => {
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // Add loading states
    addLoadingStates() {
        console.log('Adding loading states...');
        
        // Add loading states to forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function() {
                const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Loading...';
                    submitBtn.classList.add('loading');
                }
            });
        });
        
        // Add loading states to AJAX requests
        this.addAjaxLoadingStates();
    }

    // Add AJAX loading states
    addAjaxLoadingStates() {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
        
        // Add spinner CSS
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-spinner {
                    text-align: center;
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Implement error handling
    implementErrorHandling() {
        console.log('Implementing error handling...');
        
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showErrorMessage('An unexpected error occurred. Please try again.');
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showErrorMessage('An error occurred while processing your request.');
        });
    }

    // Show error message
    showErrorMessage(message) {
        // Create or update error toast
        let errorToast = document.querySelector('.error-toast');
        
        if (!errorToast) {
            errorToast = document.createElement('div');
            errorToast.className = 'error-toast';
            errorToast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 15px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
            document.body.appendChild(errorToast);
        }
        
        errorToast.textContent = message;
        errorToast.style.transform = 'translateX(0)';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorToast.style.transform = 'translateX(100%)';
        }, 5000);
    }

    // Add keyboard shortcuts
    addKeyboardShortcuts() {
        console.log('Adding keyboard shortcuts...');
        
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"], #search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.open, .modal.active');
                if (openModal) {
                    const closeBtn = openModal.querySelector('.close, .modal-close');
                    if (closeBtn) {
                        closeBtn.click();
                    }
                }
            }
        });
    }

    // Optimize for mobile
    optimizeForMobile() {
        console.log('Optimizing for mobile...');
        
        // Add touch feedback
        this.addTouchFeedback();
        
        // Optimize touch targets
        this.optimizeTouchTargets();
        
        // Add swipe gestures
        this.addSwipeGestures();
        
        // Prevent zoom on input focus (iOS)
        this.preventInputZoom();
    }

    // Add touch feedback
    addTouchFeedback() {
        document.querySelectorAll('button, .btn, a, .item-card').forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
        });
        
        // Add CSS for touch feedback
        if (!document.querySelector('#touch-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'touch-feedback-styles';
            style.textContent = `
                .touch-active {
                    opacity: 0.7;
                    transform: scale(0.98);
                    transition: all 0.1s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Optimize touch targets
    optimizeTouchTargets() {
        document.querySelectorAll('button, a, input, .clickable').forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
                element.style.display = 'inline-flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
            }
        });
    }

    // Add swipe gestures
    addSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right
                    this.handleSwipeRight();
                } else {
                    // Swipe left
                    this.handleSwipeLeft();
                }
            }
        }, { passive: true });
    }

    // Handle swipe right
    handleSwipeRight() {
        // Open navigation menu if closed
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (navMenu && !navMenu.classList.contains('active')) {
            hamburger?.click();
        }
    }

    // Handle swipe left
    handleSwipeLeft() {
        // Close navigation menu if open
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (navMenu && navMenu.classList.contains('active')) {
            hamburger?.click();
        }
    }

    // Prevent input zoom on iOS
    preventInputZoom() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            document.querySelectorAll('input, textarea, select').forEach(input => {
                if (parseFloat(getComputedStyle(input).fontSize) < 16) {
                    input.style.fontSize = '16px';
                }
            });
        }
    }
}

// Initialize application finalizer
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app initialization, then finalize
    if (window.KinshipApp && window.KinshipApp.isInitialized) {
        const finalizer = new ApplicationFinalizer();
        finalizer.finalizeApplication();
    } else {
        window.addEventListener('kinshipAppInitialized', () => {
            const finalizer = new ApplicationFinalizer();
            finalizer.finalizeApplication();
        });
    }
});

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ApplicationFinalizer = ApplicationFinalizer;
}