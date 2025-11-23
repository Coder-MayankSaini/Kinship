/**
 * Pirate Theme Animations Controller
 * Handles interactive animations and effects for the pirate-themed interface
 */

class PirateAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallaxEffects();
        this.setupInteractiveElements();
        this.setupLoadingStates();
        this.setupEntranceAnimations();
        this.setupHoverEffects();
    }

    /**
     * Setup subtle parallax effects for background textures
     */
    setupParallaxEffects() {
        // Create parallax background element if it doesn't exist
        if (!document.querySelector('.parallax-bg')) {
            const parallaxBg = document.createElement('div');
            parallaxBg.className = 'parallax-bg';
            document.body.insertBefore(parallaxBg, document.body.firstChild);
        }

        // Add scroll-based parallax effect
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-bg, .hero');
            
            parallaxElements.forEach(element => {
                const speed = element.classList.contains('hero') ? 0.5 : 0.3;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };

        const requestParallaxUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    }

    /**
     * Setup interactive elements with pirate-themed classes
     */
    setupInteractiveElements() {
        // Add pirate interactive classes to buttons and cards
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        const cards = document.querySelectorAll('.item-card, .user-profile-card, .review-card');
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea');

        buttons.forEach(btn => {
            btn.classList.add('pirate-interactive', 'gpu-accelerated');
        });

        cards.forEach(card => {
            card.classList.add('pirate-interactive', 'gpu-accelerated');
        });

        interactiveElements.forEach(element => {
            element.classList.add('pirate-transition');
        });
    }

    /**
     * Enhanced loading states with treasure-themed animations
     */
    setupLoadingStates() {
        // Override existing loading functionality to use pirate animations
        const originalAddLoading = window.addLoadingState || function() {};
        const originalRemoveLoading = window.removeLoadingState || function() {};

        window.addLoadingState = (element) => {
            if (element && !element.classList.contains('loading')) {
                element.classList.add('loading');
                element.setAttribute('aria-busy', 'true');
                
                // Add treasure-specific loading animation based on button type
                if (element.classList.contains('save-btn') || element.classList.contains('save-profile-btn')) {
                    element.setAttribute('data-loading-type', 'chest');
                } else if (element.classList.contains('browse-btn') || element.classList.contains('rent-now-btn')) {
                    element.setAttribute('data-loading-type', 'ship');
                } else if (element.classList.contains('contact-owner-btn')) {
                    element.setAttribute('data-loading-type', 'compass');
                } else if (element.classList.contains('add-item-btn')) {
                    element.setAttribute('data-loading-type', 'hunt');
                } else {
                    element.setAttribute('data-loading-type', 'treasure');
                }
            }
            originalAddLoading(element);
        };

        window.removeLoadingState = (element) => {
            if (element && element.classList.contains('loading')) {
                element.classList.remove('loading');
                element.setAttribute('aria-busy', 'false');
                element.removeAttribute('data-loading-type');
                
                // Add completion animation
                element.classList.add('loading-complete');
                setTimeout(() => {
                    element.classList.remove('loading-complete');
                }, 600);
            }
            originalRemoveLoading(element);
        };
    }

    /**
     * Setup entrance animations for page elements
     */
    setupEntranceAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Add staggered animation classes
                    if (element.classList.contains('item-card')) {
                        element.classList.add('animate-fade-up', 'pirate-stagger');
                    } else if (element.classList.contains('filter-sidebar')) {
                        element.classList.add('animate-slide-left');
                    } else if (element.classList.contains('user-profile-card')) {
                        element.classList.add('animate-slide-right');
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe elements for entrance animations
        const animatedElements = document.querySelectorAll('.item-card, .filter-sidebar, .user-profile-card, .review-card');
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Setup enhanced hover effects
     */
    setupHoverEffects() {
        // Add treasure glow effect to interactive elements
        const glowElements = document.querySelectorAll('.btn-primary, .btn-secondary, .item-card, .favorite-btn');
        
        glowElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.classList.add('pirate-hover-glow');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('pirate-hover-glow');
            });
        });

        // Add lift effect to cards
        const liftElements = document.querySelectorAll('.item-card, .user-profile-card, .review-card');
        
        liftElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.classList.add('pirate-hover-lift');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('pirate-hover-lift');
            });
        });

        // Add scale effect to buttons
        const scaleElements = document.querySelectorAll('.gallery-nav, .favorite-btn, .pagination button');
        
        scaleElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.classList.add('pirate-hover-scale');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('pirate-hover-scale');
            });
        });
    }

    /**
     * Add treasure sparkle effect to an element
     */
    addTreasureSparkle(element) {
        const sparkle = document.createElement('div');
        sparkle.className = 'treasure-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 4px;
            height: 4px;
            background: var(--pirate-gold);
            border-radius: 50%;
            pointer-events: none;
            animation: sparkleFloat 1s ease-out forwards;
            z-index: 1000;
        `;
        
        // Add sparkle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sparkleFloat {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(0) translateY(-20px);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.querySelector('#sparkle-styles')) {
            style.id = 'sparkle-styles';
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }

    /**
     * Trigger treasure discovery animation
     */
    triggerTreasureDiscovery(element) {
        element.classList.add('treasure-discovered');
        this.addTreasureSparkle(element);
        
        setTimeout(() => {
            element.classList.remove('treasure-discovered');
        }, 1000);
    }
}

// Initialize pirate animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pirateAnimations = new PirateAnimations();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PirateAnimations;
}