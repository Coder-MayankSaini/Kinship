/**
 * Utility Functions for Kinship Rental Platform
 * Common helper functions used across the application
 */

class UtilityManager {
    constructor() {
        this.initializeToastContainer();
    }

    // Generate unique ID
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get URL parameter
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Initialize toast container
    initializeToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 20px;
            margin-bottom: 10px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.textContent = message;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }

    // Get toast color based on type
    getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showToast('Failed to copy text', 'error');
            return false;
        }
    }

    // Generate random color
    generateRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    // Calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in kilometers
        return d;
    }

    // Convert degrees to radians
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Format phone number
    formatPhoneNumber(phoneNumber) {
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phoneNumber;
    }

    // Validate phone number
    isValidPhoneNumber(phoneNumber) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(phoneNumber);
    }

    // Get time ago string
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Just now';
    }

    // Favorites utility functions
    toggleItemFavorite(itemId) {
        const currentUser = window.KinshipStorage?.getCurrentUser();
        if (!currentUser) {
            this.showToast('Please log in to manage favorites', 'info');
            return false;
        }

        const isFavorited = window.KinshipStorage.isFavorite(currentUser.id, itemId);
        
        if (isFavorited) {
            window.KinshipStorage.removeFromFavorites(currentUser.id, itemId);
            this.showToast('Removed from favorites', 'success');
        } else {
            window.KinshipStorage.addToFavorites(currentUser.id, itemId);
            this.showToast('Added to favorites', 'success');
        }

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('favoriteToggled', {
            detail: { itemId, isFavorited: !isFavorited }
        }));

        return !isFavorited;
    }

    // Check if item is favorited by current user
    isItemFavorited(itemId) {
        const currentUser = window.KinshipStorage?.getCurrentUser();
        if (!currentUser) return false;
        
        return window.KinshipStorage.isFavorite(currentUser.id, itemId);
    }

    // Get user's favorite items
    getUserFavoriteItems() {
        const currentUser = window.KinshipStorage?.getCurrentUser();
        if (!currentUser) return [];

        const favoriteIds = window.KinshipStorage.getFavorites(currentUser.id);
        return favoriteIds
            .map(id => window.KinshipStorage.getItem(id))
            .filter(item => item !== null);
    }

    // Get favorites count for current user
    getFavoritesCount() {
        const currentUser = window.KinshipStorage?.getCurrentUser();
        if (!currentUser) return 0;
        
        return window.KinshipStorage.getFavorites(currentUser.id).length;
    }
}

// Make UtilityManager globally available
window.UtilityManager = UtilityManager;

// Create global utility instance
window.KinshipUtils = new UtilityManager();

console.log('Utils module loaded');

// Global helper functions for backward compatibility
function generateId() {
    return window.KinshipUtils.generateId();
}

function formatDate(dateString) {
    return window.KinshipUtils.formatDate(dateString);
}

function formatCurrency(amount) {
    return window.KinshipUtils.formatCurrency(amount);
}

function showToast(message, type, duration) {
    return window.KinshipUtils.showToast(message, type, duration);
}

function sanitizeHTML(str) {
    return window.KinshipUtils.sanitizeHTML(str);
}

function getUrlParameter(name) {
    return window.KinshipUtils.getUrlParameter(name);
}