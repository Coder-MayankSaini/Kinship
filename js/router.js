// Kinship - Client-Side Router
// Simple client-side routing system for navigation

class KinshipRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeRouteChange = null;
        this.afterRouteChange = null;
        
        // Initialize router
        this.init();
    }

    init() {
        // Listen for popstate events (back/forward buttons)
        window.addEventListener('popstate', (event) => {
            this.handleRouteChange(event.state);
        });

        // Listen for navigation clicks - disabled for multi-page app
        // document.addEventListener('click', (event) => {
        //     const link = event.target.closest('a[href]');
        //     if (link && this.isInternalLink(link)) {
        //         event.preventDefault();
        //         this.navigate(link.href);
        //     }
        // });

        // Set initial route
        this.setCurrentRoute();
    }

    // Register a route with optional middleware
    register(path, handler, middleware = null) {
        this.routes.set(path, { handler, middleware });
    }

    // Navigate to a specific route
    navigate(url, pushState = true) {
        const urlObj = new URL(url, window.location.origin);
        const path = urlObj.pathname;
        const params = Object.fromEntries(urlObj.searchParams);

        // Call before route change hook
        if (this.beforeRouteChange) {
            const shouldContinue = this.beforeRouteChange(this.currentRoute, path);
            if (shouldContinue === false) return;
        }

        // Update browser history
        if (pushState) {
            window.history.pushState({ path, params }, '', url);
        }

        // Execute route handler
        this.executeRoute(path, params);

        // Update current route
        this.currentRoute = { path, params };

        // Call after route change hook
        if (this.afterRouteChange) {
            this.afterRouteChange(this.currentRoute);
        }
    }

    // Execute route handler
    executeRoute(path, params = {}) {
        const route = this.routes.get(path);
        
        if (route) {
            // Execute middleware if present
            if (route.middleware) {
                const shouldContinue = route.middleware(path, params);
                if (shouldContinue === false) return;
            }

            // Execute route handler
            route.handler(params);
        } else {
            // Handle 404 - redirect to home or show error
            console.warn(`Route not found: ${path}`);
            this.navigate('/', false);
        }
    }

    // Set current route based on current URL
    setCurrentRoute() {
        const path = window.location.pathname;
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        this.currentRoute = { path, params };
        this.executeRoute(path, params);
    }

    // Check if link is internal
    isInternalLink(link) {
        const href = link.getAttribute('href');
        
        // Skip external links, mailto, tel, etc.
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return false;
        }

        // Skip hash links
        if (href.startsWith('#')) {
            return false;
        }

        // Skip navigation to different HTML files - let browser handle these naturally
        if (href.endsWith('.html') && href !== window.location.pathname) {
            return false;
        }

        return true;
    }

    // Get current route information
    getCurrentRoute() {
        return this.currentRoute;
    }

    // Set hooks for route changes
    setBeforeRouteChange(callback) {
        this.beforeRouteChange = callback;
    }

    setAfterRouteChange(callback) {
        this.afterRouteChange = callback;
    }

    // Go back in history
    back() {
        window.history.back();
    }

    // Go forward in history
    forward() {
        window.history.forward();
    }

    // Replace current route without adding to history
    replace(url) {
        this.navigate(url, false);
        window.history.replaceState(this.currentRoute, '', url);
    }
}

// Navigation Manager - Handles navigation UI updates
class NavigationManager {
    constructor() {
        this.currentUser = null;
        this.breadcrumbs = [];
        
        this.init();
    }

    init() {
        // Initialize hamburger menu
        this.initializeHamburgerMenu();
        
        // Initialize navigation state
        this.updateNavigationState();
        
        // Listen for authentication changes
        window.addEventListener('authStateChanged', (event) => {
            this.currentUser = event.detail.user;
            this.updateNavigationState();
        });

        // Listen for route changes to update breadcrumbs
        if (window.KinshipRouter) {
            window.KinshipRouter.setAfterRouteChange((route) => {
                this.updateBreadcrumbs(route);
                this.updateActiveNavigation(route.path);
            });
        }
    }

    // Initialize hamburger menu functionality
    initializeHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
            
            // Close mobile menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (event) => {
                if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                    this.closeMobileMenu();
                }
            });

            // Close mobile menu on escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    this.closeMobileMenu();
                }
            });
        }
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Update ARIA attributes for accessibility
            const isOpen = navMenu.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isOpen);
            navMenu.setAttribute('aria-hidden', !isOpen);
        }
    }

    // Close mobile menu
    closeMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
        }
    }

    // Update navigation based on authentication state
    updateNavigationState() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Get current user from storage
        this.currentUser = window.KinshipStorage ? window.KinshipStorage.getCurrentUser() : null;

        // Update navigation links based on auth state
        if (this.currentUser) {
            this.updateAuthenticatedNavigation();
        } else {
            this.updateUnauthenticatedNavigation();
        }
    }

    // Update navigation for authenticated users
    updateAuthenticatedNavigation() {
        // For multi-page app, just update the active states and logout functionality
        this.updateActiveNavigation(window.location.pathname);
        this.addLogoutFunctionality();
    }

    // Update navigation for unauthenticated users
    updateUnauthenticatedNavigation() {
        // For multi-page app, just update the active states
        this.updateActiveNavigation(window.location.pathname);
        this.removeLogoutFunctionality();
    }

    // Add logout functionality to existing navigation
    addLogoutFunctionality() {
        // Check if logout link already exists
        let logoutLink = document.querySelector('a[data-action="logout"]');
        
        if (!logoutLink) {
            // Find the login link and replace it with logout
            const loginLink = document.querySelector('a[href="auth.html"]');
            if (loginLink) {
                loginLink.textContent = 'Logout';
                loginLink.href = '#';
                loginLink.setAttribute('data-action', 'logout');
                loginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }
        }
    }

    // Remove logout functionality
    removeLogoutFunctionality() {
        const logoutLink = document.querySelector('a[data-action="logout"]');
        if (logoutLink) {
            logoutLink.textContent = 'Login';
            logoutLink.href = 'auth.html';
            logoutLink.removeAttribute('data-action');
            // Remove event listeners by cloning the element
            const newLink = logoutLink.cloneNode(true);
            logoutLink.parentNode.replaceChild(newLink, logoutLink);
        }
    }



    // Handle logout
    handleLogout() {
        if (window.KinshipAuth && window.KinshipAuth.logout) {
            window.KinshipAuth.logout();
        } else if (window.KinshipStorage) {
            window.KinshipStorage.clearCurrentUser();
            this.currentUser = null;
            this.updateNavigationState();
            
            // Dispatch auth state change event
            window.dispatchEvent(new CustomEvent('authStateChanged', {
                detail: { user: null }
            }));
            
            // Redirect to home
            if (window.KinshipRouter) {
                window.KinshipRouter.navigate('/');
            } else {
                window.location.href = 'index.html';
            }
        }
    }

    // Update active navigation item
    updateActiveNavigation(currentPath) {
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const linkHref = link.getAttribute('href');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            // Check if this link matches the current page
            if (linkHref === currentPage || 
                (currentPage === 'index.html' && linkHref === 'index.html') ||
                (currentPath === '/' && linkHref === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Update breadcrumbs
    updateBreadcrumbs(route) {
        this.breadcrumbs = this.generateBreadcrumbs(route);
        this.renderBreadcrumbs();
    }

    // Generate breadcrumb data
    generateBreadcrumbs(route) {
        const breadcrumbs = [{ text: 'Home', href: 'index.html' }];
        
        const pathMap = {
            '/browse.html': { text: 'Browse Items', href: 'browse.html' },
            '/item-detail.html': { text: 'Item Details', href: null },
            '/profile.html': { text: 'Profile', href: 'profile.html' },
            '/list-item.html': { text: 'List Item', href: 'list-item.html' },
            '/auth.html': { text: 'Login', href: 'auth.html' }
        };

        const currentPage = pathMap[route.path];
        if (currentPage && route.path !== '/' && !route.path.endsWith('index.html')) {
            breadcrumbs.push(currentPage);
        }

        // Add specific breadcrumbs based on URL parameters
        if (route.path === '/item-detail.html' && route.params.id) {
            breadcrumbs.push({ text: 'Item Details', href: null });
        }

        if (route.path === '/browse.html' && route.params.category) {
            const categoryName = route.params.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            breadcrumbs.push({ text: categoryName, href: null });
        }

        return breadcrumbs;
    }

    // Render breadcrumbs
    renderBreadcrumbs() {
        let breadcrumbContainer = document.querySelector('.breadcrumbs');
        
        // Create breadcrumb container if it doesn't exist
        if (!breadcrumbContainer && this.breadcrumbs.length > 1) {
            breadcrumbContainer = document.createElement('nav');
            breadcrumbContainer.className = 'breadcrumbs';
            breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb navigation');
            
            // Insert after header
            const header = document.querySelector('header');
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(breadcrumbContainer, header.nextSibling);
            }
        }

        if (!breadcrumbContainer) return;

        // Clear existing breadcrumbs
        breadcrumbContainer.innerHTML = '';

        // Don't show breadcrumbs on homepage
        if (this.breadcrumbs.length <= 1) {
            breadcrumbContainer.style.display = 'none';
            return;
        }

        breadcrumbContainer.style.display = 'block';

        // Create breadcrumb list
        const ol = document.createElement('ol');
        ol.className = 'breadcrumb-list';

        this.breadcrumbs.forEach((crumb, index) => {
            const li = document.createElement('li');
            li.className = 'breadcrumb-item';

            if (index === this.breadcrumbs.length - 1) {
                // Current page - no link
                li.textContent = crumb.text;
                li.setAttribute('aria-current', 'page');
            } else {
                // Link to previous pages
                const a = document.createElement('a');
                a.href = crumb.href;
                a.textContent = crumb.text;
                li.appendChild(a);
            }

            ol.appendChild(li);
        });

        breadcrumbContainer.appendChild(ol);
    }

    // Get current breadcrumbs
    getBreadcrumbs() {
        return this.breadcrumbs;
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation manager only (no router for multi-page app)
    window.KinshipNavigation = new NavigationManager();
    
    // Update navigation state on page load
    window.KinshipNavigation.updateNavigationState();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KinshipRouter, NavigationManager };
}