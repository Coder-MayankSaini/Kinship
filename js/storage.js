// Kinship - Local Storage Management System
// Handles all data persistence using browser localStorage

// Storage keys
const STORAGE_KEYS = {
    USERS: 'kinship_users',
    ITEMS: 'kinship_items',
    BOOKINGS: 'kinship_bookings',
    REVIEWS: 'kinship_reviews',
    CURRENT_USER: 'kinship_current_user',
    FAVORITES: 'kinship_favorites_'
};

// Storage Manager Class
class StorageManager {
    constructor() {
        this.initializeStorage();
    }

    // Initialize storage with default data if empty
    initializeStorage() {
        if (!this.getUsers()) {
            this.saveData(STORAGE_KEYS.USERS, []);
        }
        if (!this.getItems()) {
            this.saveData(STORAGE_KEYS.ITEMS, []);
        }
        if (!this.getBookings()) {
            this.saveData(STORAGE_KEYS.BOOKINGS, []);
        }
        if (!this.getReviews()) {
            this.saveData(STORAGE_KEYS.REVIEWS, []);
        }
    }

    // Generic data operations
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error retrieving data from localStorage:', error);
            return null;
        }
    }

    // User Management
    saveUser(userData) {
        const users = this.getUsers() || [];
        const existingUserIndex = users.findIndex(user => user.id === userData.id);

        if (existingUserIndex !== -1) {
            users[existingUserIndex] = userData;
        } else {
            users.push(userData);
        }

        return this.saveData(STORAGE_KEYS.USERS, users);
    }

    getUser(userId) {
        const users = this.getUsers();
        return users ? users.find(user => user.id === userId) : null;
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users ? users.find(user => user.email === email) : null;
    }

    getUsers() {
        return this.getData(STORAGE_KEYS.USERS);
    }

    deleteUser(userId) {
        const users = this.getUsers() || [];
        const filteredUsers = users.filter(user => user.id !== userId);
        return this.saveData(STORAGE_KEYS.USERS, filteredUsers);
    }

    // Current User Session
    setCurrentUser(userId) {
        console.log('StorageManager: Setting current user ID:', userId);
        const result = this.saveData(STORAGE_KEYS.CURRENT_USER, userId);
        if (result) {
            console.log('StorageManager: Current user ID saved successfully');
        } else {
            console.error('StorageManager: Failed to save current user ID');
        }
        return result;
    }

    getCurrentUser() {
        try {
            const storedData = this.getData(STORAGE_KEYS.CURRENT_USER);
            console.log('StorageManager: Getting current user, stored data type:', typeof storedData);

            if (!storedData) {
                console.log('StorageManager: No current user data found');
                return null;
            }

            // Check if it's already a user object (legacy format)
            if (typeof storedData === 'object' && storedData.id) {
                console.log('StorageManager: Found user object directly:', storedData.profile?.name);
                return storedData;
            }

            // Otherwise, it should be a user ID
            const userId = storedData;
            const user = this.getUser(userId);
            if (!user) {
                console.log('StorageManager: User data not found for ID:', userId);
                // Clear invalid session
                this.clearCurrentUser();
                return null;
            }

            console.log('StorageManager: Current user retrieved:', user.profile?.name);
            return user;
        } catch (error) {
            console.error('StorageManager: Error getting current user:', error);
            return null;
        }
    }

    clearCurrentUser() {
        console.log('StorageManager: Clearing current user session');
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    // Item Management
    saveItem(itemData) {
        const items = this.getItems() || [];
        const existingItemIndex = items.findIndex(item => item.id === itemData.id);

        if (existingItemIndex !== -1) {
            items[existingItemIndex] = itemData;
        } else {
            items.push(itemData);
        }

        return this.saveData(STORAGE_KEYS.ITEMS, items);
    }

    getItem(itemId) {
        const items = this.getItems();
        if (!items) return null;
        
        // Try to find item with exact match first
        let item = items.find(item => item.id === itemId);
        
        // If not found, try with type conversion
        if (!item) {
            // Try converting both to strings for comparison
            item = items.find(item => String(item.id) === String(itemId));
        }
        
        // If still not found and itemId is numeric, try as number
        if (!item && !isNaN(itemId)) {
            item = items.find(item => item.id === parseInt(itemId));
        }
        
        return item;
    }

    getItems(filters = {}) {
        let items = this.getData(STORAGE_KEYS.ITEMS) || [];

        // Apply filters
        if (filters.category) {
            items = items.filter(item => item.category === filters.category);
        }

        if (filters.ownerId) {
            items = items.filter(item => item.ownerId === filters.ownerId);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.minPrice !== undefined) {
            items = items.filter(item => item.pricing.daily >= filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            items = items.filter(item => item.pricing.daily <= filters.maxPrice);
        }

        if (filters.location) {
            items = items.filter(item =>
                item.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        if (filters.minRating !== undefined) {
            items = items.filter(item => item.rating >= filters.minRating);
        }

        return items;
    }

    deleteItem(itemId) {
        const items = this.getItems() || [];
        const filteredItems = items.filter(item => item.id !== itemId);
        return this.saveData(STORAGE_KEYS.ITEMS, filteredItems);
    }

    // Booking Management
    saveBooking(bookingData) {
        const bookings = this.getBookings() || [];
        const existingBookingIndex = bookings.findIndex(booking => booking.id === bookingData.id);

        if (existingBookingIndex !== -1) {
            bookings[existingBookingIndex] = bookingData;
        } else {
            bookings.push(bookingData);
        }

        return this.saveData(STORAGE_KEYS.BOOKINGS, bookings);
    }

    getBooking(bookingId) {
        const bookings = this.getBookings();
        return bookings ? bookings.find(booking => booking.id === bookingId) : null;
    }

    getBookings(filters = {}) {
        let bookings = this.getData(STORAGE_KEYS.BOOKINGS) || [];

        if (filters.renterId) {
            bookings = bookings.filter(booking => booking.renterId === filters.renterId);
        }

        if (filters.itemId) {
            bookings = bookings.filter(booking => booking.itemId === filters.itemId);
        }

        if (filters.status) {
            bookings = bookings.filter(booking => booking.status === filters.status);
        }

        return bookings;
    }

    deleteBooking(bookingId) {
        const bookings = this.getBookings() || [];
        const filteredBookings = bookings.filter(booking => booking.id !== bookingId);
        return this.saveData(STORAGE_KEYS.BOOKINGS, filteredBookings);
    }

    // Favorites Management
    saveFavorites(userId, itemIds) {
        const key = STORAGE_KEYS.FAVORITES + userId;
        return this.saveData(key, itemIds);
    }

    getFavorites(userId) {
        const key = STORAGE_KEYS.FAVORITES + userId;
        return this.getData(key) || [];
    }

    addToFavorites(userId, itemId) {
        const favorites = this.getFavorites(userId);
        if (!favorites.includes(itemId)) {
            favorites.push(itemId);
            return this.saveFavorites(userId, favorites);
        }
        return true;
    }

    removeFromFavorites(userId, itemId) {
        const favorites = this.getFavorites(userId);
        const filteredFavorites = favorites.filter(id => id !== itemId);
        return this.saveFavorites(userId, filteredFavorites);
    }

    isFavorite(userId, itemId) {
        const favorites = this.getFavorites(userId);
        return favorites.includes(itemId);
    }

    // Review Management
    saveReview(reviewData) {
        const reviews = this.getReviews() || [];
        const existingReviewIndex = reviews.findIndex(review => review.id === reviewData.id);

        if (existingReviewIndex !== -1) {
            reviews[existingReviewIndex] = reviewData;
        } else {
            reviews.push(reviewData);
        }

        // Update item rating after saving review
        this.updateItemRating(reviewData.itemId);

        return this.saveData(STORAGE_KEYS.REVIEWS, reviews);
    }

    getReview(reviewId) {
        const reviews = this.getReviews();
        return reviews ? reviews.find(review => review.id === reviewId) : null;
    }

    getReviews(filters = {}) {
        let reviews = this.getData(STORAGE_KEYS.REVIEWS) || [];

        if (filters.itemId) {
            reviews = reviews.filter(review => review.itemId === filters.itemId);
        }

        if (filters.reviewerId) {
            reviews = reviews.filter(review => review.reviewerId === filters.reviewerId);
        }

        if (filters.bookingId) {
            reviews = reviews.filter(review => review.bookingId === filters.bookingId);
        }

        // Sort by creation date (newest first)
        return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    deleteReview(reviewId) {
        const reviews = this.getReviews() || [];
        const review = reviews.find(r => r.id === reviewId);
        const filteredReviews = reviews.filter(review => review.id !== reviewId);

        const success = this.saveData(STORAGE_KEYS.REVIEWS, filteredReviews);

        // Update item rating after deleting review
        if (success && review) {
            this.updateItemRating(review.itemId);
        }

        return success;
    }

    // Update item rating based on reviews
    updateItemRating(itemId) {
        const reviews = this.getReviews({ itemId });
        const item = this.getItem(itemId);

        if (!item) return false;

        if (reviews.length === 0) {
            item.rating = 0;
            item.reviewCount = 0;
        } else {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            item.rating = totalRating / reviews.length;
            item.reviewCount = reviews.length;
        }

        return this.saveItem(item);
    }

    // Get user's average rating as an owner
    getUserRating(userId) {
        const userItems = this.getItems({ ownerId: userId });
        const allReviews = [];

        userItems.forEach(item => {
            const itemReviews = this.getReviews({ itemId: item.id });
            allReviews.push(...itemReviews);
        });

        if (allReviews.length === 0) {
            return { rating: 0, reviewCount: 0 };
        }

        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        return {
            rating: totalRating / allReviews.length,
            reviewCount: allReviews.length
        };
    }

    // Check if user can review an item (must have completed booking)
    canUserReview(userId, itemId, bookingId = null) {
        const bookings = this.getBookings({ renterId: userId, itemId });

        // Find completed bookings
        const completedBookings = bookings.filter(booking => booking.status === 'completed');

        if (completedBookings.length === 0) {
            return { canReview: false, reason: 'No completed bookings for this item' };
        }

        // If specific booking provided, check if it's completed
        if (bookingId) {
            const specificBooking = completedBookings.find(booking => booking.id === bookingId);
            if (!specificBooking) {
                return { canReview: false, reason: 'Booking not found or not completed' };
            }
        }

        // Check if user already reviewed this item for any completed booking
        const existingReviews = this.getReviews({ itemId, reviewerId: userId });
        if (existingReviews.length > 0) {
            return { canReview: false, reason: 'You have already reviewed this item' };
        }

        return { canReview: true, bookings: completedBookings };
    }

    // Data Export/Import
    exportAllData() {
        return {
            users: this.getUsers(),
            items: this.getItems(),
            bookings: this.getBookings(),
            timestamp: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.users) {
                this.saveData(STORAGE_KEYS.USERS, data.users);
            }
            if (data.items) {
                this.saveData(STORAGE_KEYS.ITEMS, data.items);
            }
            if (data.bookings) {
                this.saveData(STORAGE_KEYS.BOOKINGS, data.bookings);
            }
            if (data.reviews) {
                this.saveData(STORAGE_KEYS.REVIEWS, data.reviews);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });

        // Clear favorites for all users
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(STORAGE_KEYS.FAVORITES)) {
                localStorage.removeItem(key);
            }
        });

        this.initializeStorage();
    }

    // Get storage usage statistics
    getStorageStats() {
        const users = this.getUsers() || [];
        const items = this.getItems() || [];
        const bookings = this.getBookings() || [];
        const reviews = this.getReviews() || [];

        return {
            totalUsers: users.length,
            totalItems: items.length,
            totalBookings: bookings.length,
            totalReviews: reviews.length,
            storageUsed: this.getStorageSize()
        };
    }

    // Calculate storage size
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('kinship_')) {
                total += localStorage[key].length;
            }
        }
        return total;
    }
}

// Make StorageManager globally available
window.StorageManager = StorageManager;

// Create global storage instance
window.KinshipStorage = new StorageManager();

// Data validation functions
function validateUserData(userData) {
    const required = ['id', 'email', 'password'];
    return required.every(field => userData.hasOwnProperty(field) && userData[field]);
}

function validateItemData(itemData) {
    const required = ['id', 'ownerId', 'title', 'description', 'category', 'pricing'];
    return required.every(field => itemData.hasOwnProperty(field) && itemData[field]);
}

function validateBookingData(bookingData) {
    const required = ['id', 'itemId', 'renterId', 'startDate', 'endDate', 'totalPrice', 'status'];
    return required.every(field => bookingData.hasOwnProperty(field) && bookingData[field]);
}

function validateReviewData(reviewData) {
    const required = ['id', 'itemId', 'reviewerId', 'bookingId', 'rating', 'comment'];
    return required.every(field => reviewData.hasOwnProperty(field) && reviewData[field] !== undefined);
}

// Export validation functions
window.KinshipValidation = {
    validateUserData,
    validateItemData,
    validateBookingData,
    validateReviewData
};

// Global helper functions for backward compatibility
function saveUser(userData) {
    return window.KinshipStorage.saveUser(userData);
}

function getUser(userId) {
    return window.KinshipStorage.getUser(userId);
}

function getUserByEmail(email) {
    return window.KinshipStorage.getUserByEmail(email);
}

function getUsers() {
    return window.KinshipStorage.getUsers();
}

function getCurrentUser() {
    return window.KinshipStorage.getCurrentUser();
}

function setCurrentUser(userId) {
    return window.KinshipStorage.setCurrentUser(userId);
}

function clearCurrentUser() {
    return window.KinshipStorage.clearCurrentUser();
}

function saveItem(itemData) {
    return window.KinshipStorage.saveItem(itemData);
}

function getItem(itemId) {
    return window.KinshipStorage.getItem(itemId);
}

function getItems(filters) {
    return window.KinshipStorage.getItems(filters);
}

function saveBooking(bookingData) {
    return window.KinshipStorage.saveBooking(bookingData);
}

function getBooking(bookingId) {
    return window.KinshipStorage.getBooking(bookingId);
}

function getBookings(filters) {
    return window.KinshipStorage.getBookings(filters);
}

function saveFavorites(userId, itemIds) {
    return window.KinshipStorage.saveFavorites(userId, itemIds);
}

function getFavorites(userId) {
    return window.KinshipStorage.getFavorites(userId);
}

function addToFavorites(userId, itemId) {
    return window.KinshipStorage.addToFavorites(userId, itemId);
}

function removeFromFavorites(userId, itemId) {
    return window.KinshipStorage.removeFromFavorites(userId, itemId);
}

function isFavorite(userId, itemId) {
    return window.KinshipStorage.isFavorite(userId, itemId);
}

function saveReview(reviewData) {
    return window.KinshipStorage.saveReview(reviewData);
}

function getReview(reviewId) {
    return window.KinshipStorage.getReview(reviewId);
}

function getReviews(filters) {
    return window.KinshipStorage.getReviews(filters);
}

function deleteReview(reviewId) {
    return window.KinshipStorage.deleteReview(reviewId);
}

function getUserRating(userId) {
    return window.KinshipStorage.getUserRating(userId);
}

function canUserReview(userId, itemId, bookingId) {
    return window.KinshipStorage.canUserReview(userId, itemId, bookingId);
}