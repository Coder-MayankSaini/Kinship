/**
 * Admin Utilities for Kinship Platform
 * Provides administrative functions for managing data
 */

window.AdminUtils = {
    /**
     * Clear all listings from the platform
     * @param {boolean} confirm - Whether to ask for confirmation
     * @returns {boolean} Success status
     */
    clearAllListings: function(confirmAction = true) {
        try {
            const allItems = window.KinshipStorage.getItems() || [];
            
            if (allItems.length === 0) {
                console.log('No listings to remove');
                window.KinshipUtils?.showToast('No listings found', 'info');
                return true;
            }
            
            if (confirmAction) {
                const confirmed = confirm(`Are you sure you want to delete all ${allItems.length} listings? This action cannot be undone.`);
                if (!confirmed) {
                    console.log('Clear listings cancelled by user');
                    return false;
                }
            }
            
            // Clear all items
            const cleared = window.KinshipStorage.saveData('kinship_items', []);
            
            if (cleared) {
                console.log(`Successfully removed ${allItems.length} listings`);
                window.KinshipUtils?.showToast(`${allItems.length} listings removed`, 'success');
                
                // Refresh UI if on relevant pages
                if (window.location.pathname.includes('profile') && window.profileManager) {
                    window.profileManager.loadUserListings();
                }
                if (window.location.pathname.includes('browse') && window.browseManager) {
                    window.browseManager.loadItems();
                }
                
                return true;
            } else {
                console.error('Failed to clear listings');
                window.KinshipUtils?.showToast('Failed to clear listings', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error clearing listings:', error);
            window.KinshipUtils?.showToast('An error occurred', 'error');
            return false;
        }
    },
    
    /**
     * Clear all bookings from the platform
     * @param {boolean} confirm - Whether to ask for confirmation
     * @returns {boolean} Success status
     */
    clearAllBookings: function(confirmAction = true) {
        try {
            const allBookings = window.KinshipStorage.getBookings() || [];
            
            if (allBookings.length === 0) {
                console.log('No bookings to remove');
                window.KinshipUtils?.showToast('No bookings found', 'info');
                return true;
            }
            
            if (confirmAction) {
                const confirmed = confirm(`Are you sure you want to delete all ${allBookings.length} bookings? This action cannot be undone.`);
                if (!confirmed) {
                    console.log('Clear bookings cancelled by user');
                    return false;
                }
            }
            
            const cleared = window.KinshipStorage.saveData('kinship_bookings', []);
            
            if (cleared) {
                console.log(`Successfully removed ${allBookings.length} bookings`);
                window.KinshipUtils?.showToast(`${allBookings.length} bookings removed`, 'success');
                return true;
            } else {
                console.error('Failed to clear bookings');
                window.KinshipUtils?.showToast('Failed to clear bookings', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error clearing bookings:', error);
            window.KinshipUtils?.showToast('An error occurred', 'error');
            return false;
        }
    },
    
    /**
     * Clear all reviews from the platform
     * @param {boolean} confirm - Whether to ask for confirmation
     * @returns {boolean} Success status
     */
    clearAllReviews: function(confirmAction = true) {
        try {
            const allReviews = window.KinshipStorage.getReviews() || [];
            
            if (allReviews.length === 0) {
                console.log('No reviews to remove');
                window.KinshipUtils?.showToast('No reviews found', 'info');
                return true;
            }
            
            if (confirmAction) {
                const confirmed = confirm(`Are you sure you want to delete all ${allReviews.length} reviews? This action cannot be undone.`);
                if (!confirmed) {
                    console.log('Clear reviews cancelled by user');
                    return false;
                }
            }
            
            const cleared = window.KinshipStorage.saveData('kinship_reviews', []);
            
            if (cleared) {
                console.log(`Successfully removed ${allReviews.length} reviews`);
                window.KinshipUtils?.showToast(`${allReviews.length} reviews removed`, 'success');
                
                // Reset all item ratings
                const items = window.KinshipStorage.getItems() || [];
                items.forEach(item => {
                    item.rating = 0;
                    item.reviewCount = 0;
                });
                window.KinshipStorage.saveData('kinship_items', items);
                
                return true;
            } else {
                console.error('Failed to clear reviews');
                window.KinshipUtils?.showToast('Failed to clear reviews', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error clearing reviews:', error);
            window.KinshipUtils?.showToast('An error occurred', 'error');
            return false;
        }
    },
    
    /**
     * Reset all data to a clean state
     * @param {boolean} confirm - Whether to ask for confirmation
     * @returns {boolean} Success status
     */
    resetAllData: function(confirmAction = true) {
        if (confirmAction) {
            const confirmed = confirm('Are you sure you want to reset ALL data? This will remove all users, listings, bookings, and reviews. This action cannot be undone.');
            if (!confirmed) {
                console.log('Reset cancelled by user');
                return false;
            }
        }
        
        try {
            // Clear all data
            window.KinshipStorage.clearAllData();
            console.log('All data has been reset');
            window.KinshipUtils?.showToast('All data has been reset', 'success');
            
            // Redirect to home page after a delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);
            window.KinshipUtils?.showToast('Failed to reset data', 'error');
            return false;
        }
    },
    
    /**
     * Get statistics about the current data
     * @returns {Object} Data statistics
     */
    getDataStats: function() {
        const stats = window.KinshipStorage.getStorageStats();
        console.log('=== Kinship Data Statistics ===');
        console.log(`Users: ${stats.totalUsers}`);
        console.log(`Listings: ${stats.totalItems}`);
        console.log(`Bookings: ${stats.totalBookings}`);
        console.log(`Reviews: ${stats.totalReviews}`);
        console.log(`Storage Used: ${(stats.storageUsed / 1024).toFixed(2)} KB`);
        console.log('================================');
        return stats;
    }
};

// Make admin functions available in console
console.log('Admin utilities loaded. Available commands:');
console.log('  AdminUtils.clearAllListings() - Remove all listings');
console.log('  AdminUtils.clearAllBookings() - Remove all bookings');
console.log('  AdminUtils.clearAllReviews() - Remove all reviews');
console.log('  AdminUtils.resetAllData() - Reset everything');
console.log('  AdminUtils.getDataStats() - View data statistics');
