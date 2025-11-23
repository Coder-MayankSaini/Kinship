/**
 * Auth Helper - Unified authentication utilities
 * Ensures consistent user retrieval across the application
 */

window.KinshipAuthHelper = {
    /**
     * Get the current logged-in user using all available methods
     * @returns {Object|null} The current user object or null if not logged in
     */
    getCurrentUser() {
        console.log('AuthHelper: Getting current user...');
        
        // Method 1: Check KinshipAuth first (if initialized)
        if (window.KinshipAuth && window.KinshipAuth.currentUser) {
            console.log('AuthHelper: Found user in KinshipAuth');
            return window.KinshipAuth.currentUser;
        }
        
        // Method 2: Check KinshipStorage
        if (window.KinshipStorage && typeof window.KinshipStorage.getCurrentUser === 'function') {
            const storageUser = window.KinshipStorage.getCurrentUser();
            if (storageUser) {
                console.log('AuthHelper: Found user in KinshipStorage');
                // Update KinshipAuth if it exists
                if (window.KinshipAuth) {
                    window.KinshipAuth.currentUser = storageUser;
                }
                return storageUser;
            }
        }
        
        // Method 3: Check localStorage directly
        try {
            const storedData = localStorage.getItem('kinship_current_user');
            if (storedData) {
                const userData = JSON.parse(storedData);
                
                // Check if it's a user object or just an ID
                if (userData && typeof userData === 'object' && userData.id) {
                    console.log('AuthHelper: Found user object in localStorage');
                    // Update both auth systems
                    if (window.KinshipAuth) {
                        window.KinshipAuth.currentUser = userData;
                    }
                    return userData;
                } else if (userData && typeof userData === 'string') {
                    // It's a user ID, need to look up the full user
                    console.log('AuthHelper: Found user ID in localStorage, looking up user...');
                    const users = JSON.parse(localStorage.getItem('kinship_users') || '[]');
                    const user = users.find(u => u.id === userData);
                    if (user) {
                        console.log('AuthHelper: Found user by ID');
                        if (window.KinshipAuth) {
                            window.KinshipAuth.currentUser = user;
                        }
                        return user;
                    }
                }
            }
        } catch (e) {
            console.error('AuthHelper: Error reading from localStorage:', e);
        }
        
        // Method 4: Check window.KinshipApp (legacy)
        if (window.KinshipApp && window.KinshipApp.currentUser) {
            console.log('AuthHelper: Found user in KinshipApp (legacy)');
            return window.KinshipApp.currentUser;
        }
        
        console.log('AuthHelper: No user found');
        return null;
    },
    
    /**
     * Check if a user is logged in
     * @returns {boolean} True if a user is logged in
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    
    /**
     * Set the current user (login)
     * @param {Object} user - The user object to set as current
     */
    setCurrentUser(user) {
        if (!user || !user.id) {
            console.error('AuthHelper: Invalid user object');
            return false;
        }
        
        console.log('AuthHelper: Setting current user:', user.email);
        
        // Save to localStorage
        localStorage.setItem('kinship_current_user', JSON.stringify(user));
        
        // Update all auth systems
        if (window.KinshipAuth) {
            window.KinshipAuth.currentUser = user;
        }
        
        if (window.KinshipStorage && typeof window.KinshipStorage.setCurrentUser === 'function') {
            window.KinshipStorage.setCurrentUser(user.id);
        }
        
        if (window.KinshipApp) {
            window.KinshipApp.currentUser = user;
        }
        
        return true;
    },
    
    /**
     * Clear the current user (logout)
     */
    clearCurrentUser() {
        console.log('AuthHelper: Clearing current user');
        
        // Clear from localStorage
        localStorage.removeItem('kinship_current_user');
        
        // Clear from all auth systems
        if (window.KinshipAuth) {
            window.KinshipAuth.currentUser = null;
        }
        
        if (window.KinshipStorage && typeof window.KinshipStorage.clearCurrentUser === 'function') {
            window.KinshipStorage.clearCurrentUser();
        }
        
        if (window.KinshipApp) {
            window.KinshipApp.currentUser = null;
        }
    },
    
    /**
     * Wait for auth system to be ready
     * @returns {Promise} Resolves when auth is ready
     */
    waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                const user = this.getCurrentUser();
                console.log('AuthHelper: Checking auth readiness...');
                
                // Check if basic auth infrastructure is ready
                if (window.KinshipAuth || window.KinshipStorage) {
                    console.log('AuthHelper: Auth system ready');
                    resolve({ user, isAuthenticated: !!user });
                } else {
                    // Wait a bit and try again
                    setTimeout(checkAuth, 100);
                }
            };
            
            checkAuth();
        });
    }
};

// Make getCurrentUser available globally for compatibility
if (!window.KinshipAuth || !window.KinshipAuth.getCurrentUser) {
    console.log('AuthHelper: Creating global getCurrentUser fallback');
    window.KinshipAuth = window.KinshipAuth || {};
    window.KinshipAuth.getCurrentUser = function() {
        return window.KinshipAuthHelper.getCurrentUser();
    };
}

console.log('✅ Auth Helper loaded successfully');
