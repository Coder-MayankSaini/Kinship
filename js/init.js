// Initialization script to ensure all modules are loaded properly
(function() {
    console.log('Init: Starting module initialization...');
    
    // Check if modules are already initialized
    if (window.modulesInitialized) {
        console.log('Init: Modules already initialized, skipping...');
        return;
    }
    
    // Initialize Utility Manager if not already initialized
    if (!window.KinshipUtils && typeof UtilityManager !== 'undefined') {
        window.KinshipUtils = new UtilityManager();
        console.log('Init: ✓ UtilityManager initialized');
    }
    
    // Initialize Storage Manager if not already initialized
    if (!window.KinshipStorage && typeof StorageManager !== 'undefined') {
        window.KinshipStorage = new StorageManager();
        console.log('Init: ✓ StorageManager initialized');
    }
    
    // Initialize Auth Manager if not already initialized
    if (!window.KinshipAuth && typeof AuthManager !== 'undefined') {
        window.KinshipAuth = new AuthManager();
        console.log('Init: ✓ AuthManager initialized');
    }
    
    // Mark as initialized
    window.modulesInitialized = true;
    console.log('Init: All modules initialized successfully');
    
    // Dispatch event to signal initialization complete
    window.dispatchEvent(new CustomEvent('modulesInitialized', {
        detail: {
            utils: !!window.KinshipUtils,
            storage: !!window.KinshipStorage,
            auth: !!window.KinshipAuth
        }
    }));
})();
