/**
 * Booking Management System for Kinship Rental Platform
 * Handles booking creation, status management, and rental workflows
 */

class BookingManager {
    constructor() {
        this.bookingStatuses = {
            PENDING: 'pending',
            CONFIRMED: 'confirmed', 
            ACTIVE: 'active',
            COMPLETED: 'completed',
            CANCELLED: 'cancelled',
            REJECTED: 'rejected'
        };
        
        this.init();
    }

    init() {
        // Initialize booking system
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for booking status changes
        document.addEventListener('bookingStatusChanged', (event) => {
            this.handleBookingStatusChange(event.detail);
        });
    }

    /**
     * Create a new booking request
     */
    createBooking(bookingData) {
        try {
            // Validate required fields
            const requiredFields = ['itemId', 'renterId', 'ownerId', 'startDate', 'endDate', 'totalPrice'];
            for (const field of requiredFields) {
                if (!bookingData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Validate dates
            const startDate = new Date(bookingData.startDate);
            const endDate = new Date(bookingData.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (startDate < today) {
                throw new Error('Start date cannot be in the past');
            }

            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }

            // Check for conflicts
            if (this.hasConflictingBookings(bookingData.itemId, bookingData.startDate, bookingData.endDate)) {
                throw new Error('Selected dates conflict with existing bookings');
            }

            // Create booking object
            const booking = {
                id: this.generateBookingId(),
                ...bookingData,
                status: this.bookingStatuses.PENDING,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Save booking
            const success = window.KinshipStorage.saveBooking(booking);
            
            if (success) {
                // Notify owner
                this.notifyOwner(booking);
                
                // Dispatch event
                this.dispatchBookingEvent('created', booking);
                
                return { success: true, booking };
            } else {
                throw new Error('Failed to save booking');
            }

        } catch (error) {
            console.error('Error creating booking:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update booking status
     */
    updateBookingStatus(bookingId, newStatus, message = '') {
        try {
            const booking = window.KinshipStorage.getBooking(bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }

            // Validate status transition
            if (!this.isValidStatusTransition(booking.status, newStatus)) {
                throw new Error(`Invalid status transition from ${booking.status} to ${newStatus}`);
            }

            // Update booking
            const updatedBooking = {
                ...booking,
                status: newStatus,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    ...(booking.statusHistory || []),
                    {
                        status: newStatus,
                        timestamp: new Date().toISOString(),
                        message: message
                    }
                ]
            };

            const success = window.KinshipStorage.saveBooking(updatedBooking);
            
            if (success) {
                // Handle status-specific actions
                this.handleStatusChange(updatedBooking, booking.status, newStatus);
                
                // Dispatch event
                this.dispatchBookingEvent('statusChanged', updatedBooking);
                
                return { success: true, booking: updatedBooking };
            } else {
                throw new Error('Failed to update booking');
            }

        } catch (error) {
            console.error('Error updating booking status:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Confirm a booking (owner action)
     */
    confirmBooking(bookingId, message = '') {
        return this.updateBookingStatus(bookingId, this.bookingStatuses.CONFIRMED, message);
    }

    /**
     * Reject a booking (owner action)
     */
    rejectBooking(bookingId, message = '') {
        return this.updateBookingStatus(bookingId, this.bookingStatuses.REJECTED, message);
    }

    /**
     * Cancel a booking (renter or owner action)
     */
    cancelBooking(bookingId, message = '') {
        return this.updateBookingStatus(bookingId, this.bookingStatuses.CANCELLED, message);
    }

    /**
     * Start a rental (when rental period begins)
     */
    startRental(bookingId) {
        return this.updateBookingStatus(bookingId, this.bookingStatuses.ACTIVE, 'Rental period started');
    }

    /**
     * Complete a rental (when rental period ends)
     */
    completeRental(bookingId) {
        return this.updateBookingStatus(bookingId, this.bookingStatuses.COMPLETED, 'Rental completed');
    }

    /**
     * Check for conflicting bookings
     */
    hasConflictingBookings(itemId, startDate, endDate) {
        const existingBookings = window.KinshipStorage.getBookings({ itemId });
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return existingBookings.some(booking => {
            // Skip cancelled or rejected bookings
            if (booking.status === this.bookingStatuses.CANCELLED || 
                booking.status === this.bookingStatuses.REJECTED) {
                return false;
            }
            
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            
            // Check for date overlap
            return (start < bookingEnd && end > bookingStart);
        });
    }

    /**
     * Get bookings for a user (as renter or owner)
     */
    getUserBookings(userId, role = 'both') {
        let bookings = [];
        
        if (role === 'renter' || role === 'both') {
            const renterBookings = window.KinshipStorage.getBookings({ renterId: userId });
            bookings = [...bookings, ...renterBookings.map(b => ({ ...b, userRole: 'renter' }))];
        }
        
        if (role === 'owner' || role === 'both') {
            const ownerBookings = window.KinshipStorage.getBookings({ ownerId: userId });
            bookings = [...bookings, ...ownerBookings.map(b => ({ ...b, userRole: 'owner' }))];
        }
        
        // Sort by creation date (newest first)
        return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Get pending bookings for an owner
     */
    getPendingBookingsForOwner(ownerId) {
        return window.KinshipStorage.getBookings({ 
            ownerId, 
            status: this.bookingStatuses.PENDING 
        });
    }

    /**
     * Get active rentals for a user
     */
    getActiveRentals(userId) {
        const today = new Date();
        const bookings = this.getUserBookings(userId);
        
        return bookings.filter(booking => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            
            return booking.status === this.bookingStatuses.ACTIVE ||
                   (booking.status === this.bookingStatuses.CONFIRMED && 
                    startDate <= today && endDate >= today);
        });
    }

    /**
     * Auto-update booking statuses based on dates
     */
    updateBookingStatusesByDate() {
        const allBookings = window.KinshipStorage.getBookings();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        allBookings.forEach(booking => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            
            // Start confirmed rentals
            if (booking.status === this.bookingStatuses.CONFIRMED && 
                startDate <= today && endDate >= today) {
                this.startRental(booking.id);
            }
            
            // Complete active rentals
            if (booking.status === this.bookingStatuses.ACTIVE && 
                endDate < today) {
                this.completeRental(booking.id);
            }
        });
    }

    /**
     * Validate status transitions
     */
    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [this.bookingStatuses.PENDING]: [
                this.bookingStatuses.CONFIRMED,
                this.bookingStatuses.REJECTED,
                this.bookingStatuses.CANCELLED
            ],
            [this.bookingStatuses.CONFIRMED]: [
                this.bookingStatuses.ACTIVE,
                this.bookingStatuses.CANCELLED
            ],
            [this.bookingStatuses.ACTIVE]: [
                this.bookingStatuses.COMPLETED,
                this.bookingStatuses.CANCELLED
            ],
            [this.bookingStatuses.COMPLETED]: [],
            [this.bookingStatuses.CANCELLED]: [],
            [this.bookingStatuses.REJECTED]: []
        };
        
        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }

    /**
     * Handle status-specific actions
     */
    handleStatusChange(booking, oldStatus, newStatus) {
        switch (newStatus) {
            case this.bookingStatuses.CONFIRMED:
                this.notifyRenter(booking, 'Your booking has been confirmed!');
                break;
                
            case this.bookingStatuses.REJECTED:
                this.notifyRenter(booking, 'Your booking request was declined.');
                this.releaseBookedDates(booking);
                break;
                
            case this.bookingStatuses.CANCELLED:
                const message = oldStatus === this.bookingStatuses.PENDING ? 
                    'Booking request was cancelled.' : 
                    'Booking was cancelled.';
                this.notifyParties(booking, message);
                this.releaseBookedDates(booking);
                break;
                
            case this.bookingStatuses.ACTIVE:
                this.notifyParties(booking, 'Rental period has started.');
                break;
                
            case this.bookingStatuses.COMPLETED:
                this.notifyParties(booking, 'Rental has been completed.');
                this.handleRentalCompletion(booking);
                break;
        }
    }

    /**
     * Handle rental completion tasks
     */
    handleRentalCompletion(booking) {
        // Release dates for future bookings
        this.releaseBookedDates(booking);
        
        // Notify renter that they can now review the item
        this.notifyRenter(booking, 'Your rental is complete! You can now leave a review for this item.');
        
        console.log(`Rental completed for booking ${booking.id}`);
    }

    /**
     * Release booked dates (make them available again)
     */
    releaseBookedDates(booking) {
        // This would update the item's availability calendar
        console.log(`Releasing dates for booking ${booking.id}`);
    }

    /**
     * Notification methods
     */
    notifyOwner(booking) {
        const item = window.KinshipStorage.getItem(booking.itemId);
        const renter = window.KinshipStorage.getUser(booking.renterId);
        
        console.log(`New booking request for ${item?.title} from ${renter?.profile.name}`);
        
        // In a real app, this would send email/push notifications
        this.createNotification(booking.ownerId, {
            type: 'booking_request',
            title: 'New Booking Request',
            message: `${renter?.profile.name} wants to rent your ${item?.title}`,
            bookingId: booking.id
        });
    }

    notifyRenter(booking, message) {
        console.log(`Notifying renter: ${message}`);
        
        this.createNotification(booking.renterId, {
            type: 'booking_update',
            title: 'Booking Update',
            message: message,
            bookingId: booking.id
        });
    }

    notifyParties(booking, message) {
        this.notifyRenter(booking, message);
        
        this.createNotification(booking.ownerId, {
            type: 'booking_update',
            title: 'Booking Update',
            message: message,
            bookingId: booking.id
        });
    }

    /**
     * Create in-app notification
     */
    createNotification(userId, notification) {
        // Simple notification storage - could be enhanced
        const notifications = JSON.parse(localStorage.getItem(`kinship_notifications_${userId}`) || '[]');
        
        notifications.unshift({
            id: this.generateId(),
            ...notification,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // Keep only last 50 notifications
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        localStorage.setItem(`kinship_notifications_${userId}`, JSON.stringify(notifications));
    }

    /**
     * Utility methods
     */
    generateBookingId() {
        return 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    dispatchBookingEvent(eventType, booking) {
        const event = new CustomEvent('bookingStatusChanged', {
            detail: { eventType, booking }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get booking statistics
     */
    getBookingStats(userId) {
        const bookings = this.getUserBookings(userId);
        
        return {
            total: bookings.length,
            pending: bookings.filter(b => b.status === this.bookingStatuses.PENDING).length,
            confirmed: bookings.filter(b => b.status === this.bookingStatuses.CONFIRMED).length,
            active: bookings.filter(b => b.status === this.bookingStatuses.ACTIVE).length,
            completed: bookings.filter(b => b.status === this.bookingStatuses.COMPLETED).length,
            cancelled: bookings.filter(b => b.status === this.bookingStatuses.CANCELLED).length
        };
    }

    /**
     * Format booking for display
     */
    formatBookingForDisplay(booking) {
        const item = window.KinshipStorage.getItem(booking.itemId);
        const renter = window.KinshipStorage.getUser(booking.renterId);
        const owner = window.KinshipStorage.getUser(booking.ownerId);
        
        return {
            ...booking,
            item,
            renter,
            owner,
            formattedStartDate: window.KinshipUtils?.formatDate(booking.startDate) || booking.startDate,
            formattedEndDate: window.KinshipUtils?.formatDate(booking.endDate) || booking.endDate,
            formattedPrice: window.KinshipUtils?.formatCurrency(booking.totalPrice) || `₹${booking.totalPrice}`,
            statusLabel: this.getStatusLabel(booking.status)
        };
    }

    getStatusLabel(status) {
        const labels = {
            [this.bookingStatuses.PENDING]: 'Pending Approval',
            [this.bookingStatuses.CONFIRMED]: 'Confirmed',
            [this.bookingStatuses.ACTIVE]: 'Active Rental',
            [this.bookingStatuses.COMPLETED]: 'Completed',
            [this.bookingStatuses.CANCELLED]: 'Cancelled',
            [this.bookingStatuses.REJECTED]: 'Rejected'
        };
        return labels[status] || status;
    }
}

// Initialize booking manager
window.KinshipBooking = new BookingManager();

// Auto-update booking statuses on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.KinshipBooking) {
        window.KinshipBooking.updateBookingStatusesByDate();
    }
});

// Export for global access
window.BookingManager = BookingManager;