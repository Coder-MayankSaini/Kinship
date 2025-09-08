// Minimal Auth.js for testing
console.log('Auth-minimal.js: Starting...');

// Simple AuthManager class
class AuthManager {
    constructor() {
        console.log('AuthManager: Constructor called');
        this.currentUser = null;
        
        // Don't call any initialization in constructor for testing
        console.log('AuthManager: Constructor completed');
    }
    
    // Simple test method
    test() {
        return 'AuthManager is working!';
    }
}

console.log('Auth-minimal.js: Class defined');

// Make it global
try {
    window.AuthManager = AuthManager;
    console.log('Auth-minimal.js: AuthManager made global');
} catch (e) {
    console.error('Auth-minimal.js: Error making global:', e);
}

// Create instance
try {
    window.KinshipAuth = new AuthManager();
    console.log('Auth-minimal.js: Instance created');
} catch (e) {
    console.error('Auth-minimal.js: Error creating instance:', e);
}

console.log('Auth-minimal.js: Complete');
