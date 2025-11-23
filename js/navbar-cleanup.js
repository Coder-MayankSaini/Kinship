/**
 * Navbar Cleanup Script
 * Ensures navigation links are clean without any emoji icons
 */

class NavbarCleanup {
    constructor() {
        this.init();
    }

    init() {
        // Clean navigation on page load
        this.cleanNavigation();

        // Set up observer to clean navigation if it gets modified
        this.setupNavigationObserver();

        // Clean navigation periodically (in case of browser extensions)
        this.setupPeriodicCleanup();

        // Listen for auth state changes
        this.setupAuthStateListener();
    }

    /**
     * Set up listener for authentication state changes
     */
    setupAuthStateListener() {
        window.addEventListener('authStateChanged', () => {
            setTimeout(() => {
                this.updateAuthNavigation();
            }, 100);
        });

        // Also check auth state periodically
        setInterval(() => {
            this.updateAuthNavigation();
        }, 2000);
    }

    /**
     * Clean all navigation links of any emoji or icon content
     */
    cleanNavigation() {
        const navLinks = document.querySelectorAll('.nav-menu a');

        navLinks.forEach(link => {
            // Store the original text content
            const originalText = this.getCleanText(link);

            // Clear all content and set clean text
            link.innerHTML = '';
            link.textContent = originalText;

            // Remove any data attributes that might add icons
            this.removeIconAttributes(link);

            // Ensure proper CSS classes
            this.ensureCleanStyling(link);
        });

        // Update navigation based on auth state
        this.updateAuthNavigation();
    }

    /**
     * Update navigation based on authentication state
     */
    updateAuthNavigation() {
        const currentUser = window.KinshipAuth?.getCurrentUser();
        const loginLink = document.querySelector('a[href="auth.html"]');

        if (loginLink && currentUser) {
            // User is logged in - show profile link
            loginLink.textContent = currentUser.profile.firstName || currentUser.profile.name || 'Profile';
            loginLink.href = 'profile.html';
            loginLink.title = `Logged in as ${currentUser.profile.name}`;
        } else if (loginLink && !currentUser) {
            // User is not logged in - show login link
            loginLink.textContent = 'Login';
            loginLink.href = 'auth.html';
            loginLink.title = 'Sign in to your account';
        }
    }

    /**
     * Extract clean text from navigation link
     */
    getCleanText(link) {
        const href = link.getAttribute('href');
        let cleanText = link.textContent.trim();

        // Remove any emoji characters
        cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

        // If text is empty or only emojis, determine text from href
        if (!cleanText) {
            if (href.includes('index.html') || href === '/') {
                cleanText = 'Home';
            } else if (href.includes('browse.html')) {
                cleanText = 'Browse';
            } else if (href.includes('list-item.html')) {
                cleanText = 'List Item';
            } else if (href.includes('profile.html')) {
                cleanText = 'Profile';
            } else if (href.includes('auth.html')) {
                cleanText = 'Login';
            }
        }

        return cleanText;
    }

    /**
     * Remove any attributes that might be used to add icons
     */
    removeIconAttributes(link) {
        const iconAttributes = [
            'data-icon',
            'data-emoji',
            'data-symbol',
            'data-before',
            'data-after'
        ];

        iconAttributes.forEach(attr => {
            link.removeAttribute(attr);
        });
    }

    /**
     * Ensure clean CSS styling
     */
    ensureCleanStyling(link) {
        // Remove any classes that might add icons
        const iconClasses = ['icon', 'emoji', 'symbol', 'with-icon'];
        iconClasses.forEach(className => {
            link.classList.remove(className);
        });

        // Ensure proper navigation styling
        link.style.position = 'relative';
        link.style.display = 'block';
        link.style.textDecoration = 'none';
    }

    /**
     * Set up mutation observer to watch for navigation changes
     */
    setupNavigationObserver() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        const observer = new MutationObserver((mutations) => {
            let shouldClean = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    shouldClean = true;
                }
            });

            if (shouldClean) {
                // Debounce the cleanup
                clearTimeout(this.cleanupTimeout);
                this.cleanupTimeout = setTimeout(() => {
                    this.cleanNavigation();
                }, 100);
            }
        });

        observer.observe(navMenu, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['class', 'data-icon', 'data-emoji']
        });
    }

    /**
     * Set up periodic cleanup (every 5 seconds) to handle browser extensions
     */
    setupPeriodicCleanup() {
        setInterval(() => {
            this.cleanNavigation();
        }, 5000);
    }

    /**
     * Force immediate cleanup (can be called externally)
     */
    forceCleanup() {
        this.cleanNavigation();
    }
}

// Initialize navbar cleanup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navbarCleanup = new NavbarCleanup();
});

// Also clean up after other scripts have loaded
window.addEventListener('load', () => {
    if (window.navbarCleanup) {
        window.navbarCleanup.forceCleanup();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarCleanup;
}