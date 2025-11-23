/**
 * Data Initializer
 * Automatically ensures sample data is available when the application loads
 */

(function() {
    'use strict';
    
    // Check if we're running in a browser environment
    if (typeof window === 'undefined') return;
    
    // Wait for storage to be ready
    function initializeData() {
        if (!window.KinshipStorage || !window.SampleDataGenerator) {
            // Try again in a moment
            setTimeout(initializeData, 100);
            return;
        }
        
        try {
            // Check if we have any items in storage
            const items = window.KinshipStorage.getItems();
            const users = window.KinshipStorage.getUsers();
            
            console.log('[Data Initializer] Current data status:', {
                items: items ? items.length : 0,
                users: users ? users.length : 0
            });
            
            // DISABLED: Automatic sample data loading
            // To manually load sample data, use: window.populateSampleData(true)
            if (!items || items.length === 0) {
                console.log('[Data Initializer] No items found. Automatic sample data loading is disabled.');
                console.log('[Data Initializer] To load sample data, run: window.populateSampleData(true)');
                
                // Still dispatch event but with 0 items
                window.dispatchEvent(new CustomEvent('sampleDataLoaded', {
                    detail: {
                        items: 0,
                        users: users ? users.length : 0
                    }
                }));
            } else {
                console.log('[Data Initializer] Data already exists, skipping initialization');
            }
            
            /* COMMENTED OUT - Automatic loading disabled
            // If no data exists, populate it automatically
            if (!items || items.length === 0) {
                console.log('[Data Initializer] No items found, loading sample data...');
                const result = window.SampleDataGenerator.populateSampleData(true);
                
                if (result) {
                    console.log('[Data Initializer] ✅ Sample data loaded successfully');
                    
                    // Verify the data was loaded
                    const newItems = window.KinshipStorage.getItems();
                    const newUsers = window.KinshipStorage.getUsers();
                    console.log('[Data Initializer] Data verification:', {
                        items: newItems ? newItems.length : 0,
                        users: newUsers ? newUsers.length : 0
                    });
                    
                    // Dispatch event to notify other components
                    window.dispatchEvent(new CustomEvent('sampleDataLoaded', {
                        detail: {
                            items: newItems.length,
                            users: newUsers.length
                        }
                    }));
                } else {
                    console.error('[Data Initializer] Failed to load sample data');
                }
            } else {
                console.log('[Data Initializer] Data already exists, skipping initialization');
            }
            */
            
            // Set a flag to indicate initialization is complete
            window.dataInitialized = true;
            
        } catch (error) {
            console.error('[Data Initializer] Error during initialization:', error);
        }
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeData);
    } else {
        // DOM is already loaded
        setTimeout(initializeData, 100);
    }
    
    // Expose a manual initialization function
    window.ensureDataInitialized = function(callback) {
        if (window.dataInitialized) {
            if (callback) callback();
            return;
        }
        
        // Wait for initialization to complete
        const checkInterval = setInterval(function() {
            if (window.dataInitialized) {
                clearInterval(checkInterval);
                if (callback) callback();
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(function() {
            clearInterval(checkInterval);
            console.error('[Data Initializer] Initialization timeout');
            if (callback) callback();
        }, 5000);
    };
    
})();
