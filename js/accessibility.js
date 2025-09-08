/**
 * Accessibility Enhancement Module for Kinship
 * Provides accessibility utilities and enhancements
 */

window.KinshipAccessibility = {
    
    /**
     * Initialize accessibility features
     */
    init() {
        this.addSkipLink();
        this.enhanceKeyboardNavigation();
        this.setupFocusManagement();
        this.enhanceAriaLiveRegions();
        this.setupReducedMotion();
        this.enhanceFormAccessibility();
        this.enhancePirateThemeAccessibility();
        console.log('Accessibility features initialized');
    },

    /**
     * Add skip to main content link
     */
    addSkipLink() {
        // Skip link functionality removed per user request
        
        // Ensure main content has proper ID for other accessibility features
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }
    },

    /**
     * Enhance keyboard navigation
     */
    enhanceKeyboardNavigation() {
        // Add keyboard support to category cards
        document.addEventListener('keydown', (e) => {
            const target = e.target;
            
            // Handle category card navigation
            if (target.classList.contains('category-button') || target.closest('.category-card')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    target.click();
                }
            }
            
            // Handle item card navigation
            if (target.classList.contains('item-card') || target.closest('.item-card')) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const itemCard = target.closest('.item-card') || target;
                    const itemId = itemCard.dataset.itemId;
                    if (itemId) {
                        window.location.href = `item-detail.html?id=${itemId}`;
                    }
                }
            }
            
            // Handle modal close with Escape key
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    const closeBtn = activeModal.querySelector('.close');
                    if (closeBtn) {
                        closeBtn.click();
                    }
                }
            }
        });
    },

    /**
     * Setup focus management for modals and dynamic content
     */
    setupFocusManagement() {
        // Store the last focused element before opening modal
        let lastFocusedElement = null;
        
        // Modal focus management
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-trigger]') || e.target.closest('[data-modal-trigger]')) {
                lastFocusedElement = e.target;
            }
        });
        
        // Observe modal state changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const modal = mutation.target;
                    if (modal.classList.contains('modal')) {
                        if (modal.classList.contains('active')) {
                            this.trapFocusInModal(modal);
                        } else {
                            this.restoreFocus(lastFocusedElement);
                        }
                    }
                }
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, { attributes: true });
        });
    },

    /**
     * Trap focus within modal
     */
    trapFocusInModal(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        firstElement.focus();
        
        // Add tab trap
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
        
        // Store handler for cleanup
        modal._tabHandler = handleTabKey;
    },

    /**
     * Restore focus to previously focused element
     */
    restoreFocus(element) {
        if (element && typeof element.focus === 'function') {
            element.focus();
        }
    },

    /**
     * Enhance ARIA live regions
     */
    enhanceAriaLiveRegions() {
        // Create a global announcement region
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'aria-announcer';
        document.body.appendChild(announcer);
        
        // Global announce function
        window.announceToScreenReader = (message, priority = 'polite') => {
            announcer.setAttribute('aria-live', priority);
            announcer.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        };
    },

    /**
     * Setup reduced motion preferences
     */
    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduce-motion');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        });
    },

    /**
     * Enhance form accessibility
     */
    enhanceFormAccessibility() {
        // Add live validation feedback
        document.addEventListener('input', (e) => {
            const input = e.target;
            if (input.matches('input, select, textarea')) {
                this.updateFieldValidation(input);
            }
        });
        
        // Add form submission feedback
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.matches('form')) {
                this.announceFormSubmission(form);
            }
        });
    },

    /**
     * Update field validation state
     */
    updateFieldValidation(field) {
        const isValid = field.checkValidity();
        const errorId = `${field.id}-error`;
        let errorElement = document.getElementById(errorId);
        
        if (!isValid) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'form-error';
                errorElement.setAttribute('role', 'alert');
                field.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = field.validationMessage;
            field.setAttribute('aria-describedby', errorId);
            field.setAttribute('aria-invalid', 'true');
        } else {
            if (errorElement) {
                errorElement.remove();
            }
            field.removeAttribute('aria-describedby');
            field.setAttribute('aria-invalid', 'false');
        }
    },

    /**
     * Announce form submission
     */
    announceFormSubmission(form) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.setAttribute('aria-busy', 'true');
            submitBtn.textContent = 'Submitting...';
            
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Form is being submitted');
            }
        }
    },

    /**
     * Enhance item cards with accessibility features
     */
    enhanceItemCards() {
        document.querySelectorAll('.item-card').forEach(card => {
            if (!card.hasAttribute('role')) {
                card.setAttribute('role', 'listitem');
                card.setAttribute('tabindex', '0');
                
                // Add comprehensive aria-label
                const title = card.querySelector('.item-card-title')?.textContent || '';
                const price = card.querySelector('.item-card-price')?.textContent || '';
                const location = card.querySelector('.item-card-location')?.textContent || '';
                const rating = card.querySelector('.item-card-rating')?.textContent || '';
                
                const ariaLabel = `${title}, ${price}, ${location}, ${rating}`;
                card.setAttribute('aria-label', ariaLabel);
            }
        });
    },

    /**
     * Enhance rating displays
     */
    enhanceRatings() {
        document.querySelectorAll('.item-card-rating, .author-rating, .review-rating').forEach(rating => {
            const stars = rating.querySelector('.stars');
            const ratingText = rating.textContent.trim();
            
            if (stars && !rating.querySelector('.sr-only')) {
                // Extract numeric rating
                const match = ratingText.match(/(\d+\.?\d*)/);
                const numericRating = match ? match[1] : '0';
                
                // Add screen reader text
                const srText = document.createElement('span');
                srText.className = 'sr-only';
                srText.textContent = `Rating: ${numericRating} out of 5 stars`;
                rating.appendChild(srText);
                
                // Hide visual stars from screen readers
                stars.setAttribute('aria-hidden', 'true');
            }
        });
    },

    /**
     * Enhance image galleries
     */
    enhanceImageGalleries() {
        document.querySelectorAll('.image-gallery').forEach(gallery => {
            const mainImage = gallery.querySelector('#main-gallery-image, #main-item-image');
            const thumbnails = gallery.querySelectorAll('.thumbnail');
            
            if (mainImage) {
                // Add keyboard navigation
                gallery.setAttribute('tabindex', '0');
                gallery.setAttribute('role', 'img');
                gallery.setAttribute('aria-label', 'Image gallery - use arrow keys to navigate');
                
                gallery.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const direction = e.key === 'ArrowLeft' ? -1 : 1;
                        this.navigateGallery(gallery, direction);
                    }
                });
            }
            
            // Enhance thumbnails
            thumbnails.forEach((thumb, index) => {
                thumb.setAttribute('role', 'button');
                thumb.setAttribute('tabindex', '0');
                thumb.setAttribute('aria-label', `View image ${index + 1}`);
                
                thumb.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        thumb.click();
                    }
                });
            });
        });
    },

    /**
     * Navigate image gallery with keyboard
     */
    navigateGallery(gallery, direction) {
        const thumbnails = gallery.querySelectorAll('.thumbnail');
        const activeThumbnail = gallery.querySelector('.thumbnail.active');
        
        if (!activeThumbnail || thumbnails.length === 0) return;
        
        const currentIndex = Array.from(thumbnails).indexOf(activeThumbnail);
        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) newIndex = thumbnails.length - 1;
        if (newIndex >= thumbnails.length) newIndex = 0;
        
        thumbnails[newIndex].click();
        
        // Announce change
        if (window.announceToScreenReader) {
            window.announceToScreenReader(`Image ${newIndex + 1} of ${thumbnails.length}`);
        }
    },

    /**
     * Update dynamic content accessibility
     */
    updateDynamicContent() {
        this.enhanceItemCards();
        this.enhanceRatings();
        this.enhanceImageGalleries();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.KinshipAccessibility.init();
    });
} else {
    window.KinshipAccessibility.init();
}

// Update accessibility when new content is added
const contentObserver = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.matches('.item-card, .image-gallery, [class*="rating"]') ||
                        node.querySelector('.item-card, .image-gallery, [class*="rating"]')) {
                        shouldUpdate = true;
                    }
                }
            });
        }
    });
    
    if (shouldUpdate) {
        setTimeout(() => {
            window.KinshipAccessibility.updateDynamicContent();
        }, 100);
    }
});

contentObserver.observe(document.body, {
    childList: true,
    subtree: true
});