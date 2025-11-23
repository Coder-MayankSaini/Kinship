// Kinship - Authentication System (Test Version)
// Handles user registration, login, and session management

console.log('Auth-test.js: Script starting to execute...');

// Authentication Manager Class
class AuthManager {
    constructor() {
        console.log('AuthManager: Constructor starting...');
        this.currentUser = null;
        
        // Delay initialization to avoid issues during construction
        setTimeout(() => {
            this.initializeAuth();
        }, 100);
        
        console.log('AuthManager: Constructor completed');
    }

    // Initialize authentication system
    initializeAuth() {
        console.log('AuthManager: Initializing authentication system...');
        
        try {
            this.loadCurrentUser();
        } catch (e) {
            console.error('AuthManager: Error loading current user:', e);
        }
        
        try {
            this.setupAuthEventListeners();
        } catch (e) {
            console.error('AuthManager: Error setting up event listeners:', e);
        }

        // Mark initialization as complete
        this.initializationComplete = true;

        // Dispatch initialization complete event
        try {
            window.dispatchEvent(new CustomEvent('authInitialized', {
                detail: { user: this.currentUser }
            }));
        } catch (e) {
            console.error('AuthManager: Error dispatching event:', e);
        }

        console.log('AuthManager: Initialization complete');
    }

    // Load current user from storage
    loadCurrentUser() {
        console.log('AuthManager: loadCurrentUser starting...');
        
        if (!window.KinshipStorage) {
            console.error('AuthManager: KinshipStorage not available');
            return;
        }
        
        try {
            // Use getCurrentUser method instead of getData
            const currentUserId = localStorage.getItem('kinship_current_user');
            console.log('AuthManager: Current user ID from localStorage:', currentUserId);

            if (currentUserId) {
                this.currentUser = window.KinshipStorage.getUser(currentUserId);
                console.log('AuthManager: Current user loaded:', this.currentUser ? 'Found' : 'Not found');

                if (this.currentUser) {
                    window.KinshipApp = window.KinshipApp || {};
                    window.KinshipApp.currentUser = this.currentUser;
                } else {
                    console.log('AuthManager: User ID found but user data not found, clearing session');
                    window.KinshipStorage.clearCurrentUser();
                }
            } else {
                console.log('AuthManager: No current user session found');
            }
        } catch (error) {
            console.error('AuthManager: Error in loadCurrentUser:', error);
            this.currentUser = null;
        }
    }

    // Setup event listeners for auth forms
    setupAuthEventListeners() {
        console.log('AuthManager: Setting up event listeners...');
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEventListeners());
        } else {
            this.bindEventListeners();
        }
    }

    bindEventListeners() {
        console.log('AuthManager: Binding event listeners...');
        // We'll add event listeners later
    }

    // Simple test method
    test() {
        return 'AuthManager test method works!';
    }
}

console.log('Auth-test.js: AuthManager class defined successfully');

// Make AuthManager globally available
try {
    window.AuthManager = AuthManager;
    console.log('Auth-test.js: AuthManager made globally available');
} catch (e) {
    console.error('Auth-test.js: Error making AuthManager global:', e);
}

// Initialize auth manager immediately
try {
    console.log('Auth-test.js: Creating KinshipAuth instance...');
    window.KinshipAuth = new AuthManager();
    console.log('Auth-test.js: KinshipAuth instance created successfully');
} catch (e) {
    console.error('Auth-test.js: Error creating AuthManager instance:', e);
}

console.log('Auth-test.js: Script execution complete');
