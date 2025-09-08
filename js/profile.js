/**
 * Profile Management System for Kinship Rental Platform
 * Handles user profile display, editing, listings, rentals, and favorites
 */

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.activeTab = 'listings';
        this.editProfileModal = null;
        this.init();
    }

    init() {
        console.log('ProfileManager init() called');
        console.log('ProfileManager: Current location:', window.location.href);
        console.log('ProfileManager: document.readyState:', document.readyState);
        console.log('ProfileManager: window.KinshipAuth exists:', !!window.KinshipAuth);

        // Always initialize tabs first, regardless of auth status
        this.initializeTabs();

        // Check if we need to wait for DOM or can proceed immediately
        if (document.readyState === 'loading') {
            console.log('ProfileManager: DOM still loading, waiting...');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('ProfileManager: DOM loaded, proceeding with auth...');
                this.waitForAuthAndInitialize();
            });
        } else {
            console.log('ProfileManager: DOM ready, proceeding with auth...');
            this.waitForAuthAndInitialize();
        }
    }

    async waitForAuthAndInitialize() {
        try {
            console.log('ProfileManager: Waiting for authentication system...');
            console.log('ProfileManager: window.KinshipAuth available:', !!window.KinshipAuth);
            console.log('ProfileManager: KinshipAuth initialized:', window.KinshipAuth?.initializationComplete);

            // Simple direct check first
            if (window.KinshipAuth) {
                console.log('ProfileManager: Auth available, trying direct check...');
                const currentUser = window.KinshipAuth.getCurrentUser();
                console.log('ProfileManager: Direct getCurrentUser result:', currentUser?.profile?.name || 'null');

                if (currentUser) {
                    console.log('ProfileManager: User found directly, proceeding...');
                    this.currentUser = currentUser;
                    this.populateProfileInfo();
                    this.setupEventListeners();
                    this.loadActiveTabContent();
                    console.log('ProfileManager: Profile initialized successfully (direct)');
                    return;
                }
            }

            // If direct check fails, try the promise-based approach
            console.log('ProfileManager: Direct check failed, trying promise-based approach...');

            // First check if auth is already available
            if (window.KinshipAuth && window.KinshipAuth.initializationComplete) {
                console.log('ProfileManager: Auth already available');
                this.proceedWithAuth(window.KinshipAuth);
                return;
            }

            // Wait for auth system to be ready with timeout
            const auth = await Promise.race([
                AuthManager.waitForAuth(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 5000)
                )
            ]);

            console.log('ProfileManager: Auth system ready via promise');
            this.proceedWithAuth(auth);

        } catch (error) {
            console.error('ProfileManager: Error waiting for auth:', error);

            // Final fallback: try localStorage directly
            console.log('ProfileManager: Trying localStorage fallback...');
            const userId = localStorage.getItem('kinship_current_user');
            console.log('ProfileManager: Direct localStorage check, userId:', userId);

            if (userId && window.KinshipStorage) {
                const user = window.KinshipStorage.getUser(userId);
                console.log('ProfileManager: User from storage:', user?.profile?.name || 'null');

                if (user) {
                    this.currentUser = user;
                    this.populateProfileInfo();
                    this.setupEventListeners();
                    this.loadActiveTabContent();
                    console.log('ProfileManager: Profile initialized via localStorage fallback');
                    return;
                }
            }

            console.log('ProfileManager: All auth methods failed, redirecting to login');
            window.location.href = 'auth.html';
        }
    }

    proceedWithAuth(auth) {
        console.log('ProfileManager: Proceeding with authentication check...');

        // Check authentication
        if (!auth || !auth.requireAuth()) {
            console.log('ProfileManager: Authentication failed, redirecting...');
            return;
        }

        this.currentUser = auth.getCurrentUser();
        if (!this.currentUser) {
            console.log('ProfileManager: No current user found, redirecting to auth');
            window.location.href = 'auth.html';
            return;
        }

        console.log('ProfileManager: User authenticated:', this.currentUser.profile.name);

        // Initialize profile page with user data
        this.populateProfileInfo();
        this.setupEventListeners();
        this.loadActiveTabContent();

        console.log('ProfileManager: Profile manager initialized successfully');
    }

    populateProfileInfo() {
        const user = this.currentUser;

        // Update profile header elements
        const elements = {
            'user-name': user.profile.name,
            'user-email': user.email
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update avatar
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            // If user doesn't have an avatar, generate one and save it
            if (!user.profile.avatar || user.profile.avatar.includes('default-avatar.jpg')) {
                user.profile.avatar = this.generateRandomAvatar(user.email);
                window.KinshipStorage.updateUser(user.id, user);
            }
            userAvatar.src = user.profile.avatar;
            userAvatar.alt = `${user.profile.name}'s avatar`;
        }

        // Update statistics
        this.updateUserStats();
    }

    updateUserStats() {
        // Stats display removed - method kept for compatibility
        console.log('User stats display has been removed');
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.profile-tabs .tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        console.log('Initializing tabs:', tabButtons.length, 'buttons found');
        console.log('Tab panels found:', tabPanels.length);

        // Set initial active tab
        if (tabButtons.length > 0) {
            tabButtons[0].classList.add('active');
        }
        if (tabPanels.length > 0) {
            tabPanels[0].classList.add('active');
        }

        tabButtons.forEach((button, index) => {
            console.log(`Tab button ${index}:`, button.dataset.tab, button.textContent.trim());

            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const targetTab = button.dataset.tab;
                console.log('Tab clicked:', targetTab, 'Button:', button.textContent.trim());

                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                });

                // Add active class to clicked button
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');

                // Show target panel
                const targetPanel = document.getElementById(`${targetTab}-panel`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block';
                    console.log('Panel activated:', targetPanel.id);
                } else {
                    console.error('Panel not found:', `${targetTab}-panel`);
                    // Try alternative panel ID formats
                    const altPanel = document.querySelector(`[data-tab-panel="${targetTab}"]`);
                    if (altPanel) {
                        altPanel.classList.add('active');
                        altPanel.style.display = 'block';
                        console.log('Alternative panel activated:', altPanel.id);
                    }
                }

                // Update active tab and load content
                this.activeTab = targetTab;
                this.loadTabContent(targetTab);
            });
        });

        // Debug: Log all available panels
        document.querySelectorAll('[id$="-panel"]').forEach(panel => {
            console.log('Available panel:', panel.id);
        });
    }

    setupEventListeners() {
        // Settings form
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleSettingsUpdate(e));
            this.populateSettingsForm();
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.KinshipAuth) {
                    window.KinshipAuth.logout();
                }
            });
        }

        // Change avatar functionality
        this.setupAvatarChange();
    }

    setupEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        const form = document.getElementById('edit-profile-form');
        const closeBtn = modal?.querySelector('.close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideEditProfileModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideEditProfileModal();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleProfileEdit(e));
        }
    }

    loadActiveTabContent() {
        this.loadTabContent(this.activeTab);
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'listings':
                this.loadUserListings();
                break;
            case 'rentals':
                this.loadUserRentals();
                break;
            case 'bookings':
                this.loadBookingRequests();
                break;
            case 'favorites':
                this.loadUserFavorites();
                break;
            case 'reviews':
                this.loadUserReviews();
                break;
            case 'settings':
                this.populateSettingsForm();
                break;
        }
    }

    loadUserListings() {
        const container = document.getElementById('user-listings');
        if (!container) return;

        const userItems = window.KinshipStorage.getItems({ ownerId: this.currentUser.id });

        if (userItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"></div>
                    <h3>No listings yet</h3>
                    <p>Start earning by listing your first item!</p>
                    <a href="list-item.html" class="btn-primary">List Your First Item</a>
                </div>
            `;
            return;
        }

        container.innerHTML = userItems.map(item => this.createListingCard(item)).join('');
    }

    createListingCard(item) {
        const imageUrl = item.images && item.images.length > 0
            ? item.images[0]
            : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';

        return `
            <div class="listing-card" data-item-id="${item.id}">
                <div class="listing-image" onclick="profileManager.viewListing('${item.id}')" style="cursor: pointer;">
                    <img src="${imageUrl}" alt="${item.title}" loading="lazy">
                    <div class="listing-status ${item.status || 'active'}">${item.status || 'Active'}</div>
                </div>
                <div class="listing-content">
                    <h3 class="listing-title" onclick="profileManager.viewListing('${item.id}')" style="cursor: pointer;">${item.title}</h3>
                    <p class="listing-price">${window.KinshipUtils.formatCurrency(item.pricing.daily)}/day</p>
                    <p class="listing-location">${item.location}</p>
                    <div class="listing-stats">
                        <span class="stat">
                            <span class="stat-icon">⭐</span>
                            ${(item.rating || 0).toFixed(1)}
                        </span>
                        <span class="stat">
                            <span class="stat-icon">💬</span>
                            ${item.reviewCount || 0} reviews
                        </span>
                    </div>
                    <div class="listing-actions">
                        <button class="btn-secondary" onclick="profileManager.editListing('${item.id}')" title="Edit listing">
                            <span>✏️</span> Edit
                        </button>
                        <button class="btn-danger" onclick="profileManager.deleteListing('${item.id}')" title="Delete listing">
                            <span>🗑️</span> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadUserRentals() {
        const currentContainer = document.getElementById('current-rentals');
        const pastContainer = document.getElementById('past-rentals');

        if (!currentContainer || !pastContainer) return;

        const userRentals = window.KinshipStorage.getBookings({ renterId: this.currentUser.id });
        const currentDate = new Date();

        // Separate current and past rentals
        const currentRentals = userRentals.filter(rental => {
            const endDate = new Date(rental.endDate);
            return endDate >= currentDate && (rental.status === 'confirmed' || rental.status === 'active');
        });

        const pastRentals = userRentals.filter(rental => {
            const endDate = new Date(rental.endDate);
            return endDate < currentDate || rental.status === 'completed' || rental.status === 'cancelled';
        });

        // Display current rentals
        if (currentRentals.length === 0) {
            currentContainer.innerHTML = `
                <div class="empty-state-small">
                    <p>No current rentals</p>
                    <a href="browse.html" class="btn-secondary">Browse Items</a>
                </div>
            `;
        } else {
            currentContainer.innerHTML = currentRentals.map(rental => this.createRentalCard(rental, 'current')).join('');
        }

        // Display past rentals
        if (pastRentals.length === 0) {
            pastContainer.innerHTML = `
                <div class="empty-state-small">
                    <p>No past rentals</p>
                </div>
            `;
        } else {
            pastContainer.innerHTML = pastRentals.map(rental => this.createRentalCard(rental, 'past')).join('');
        }
    }

    createRentalCard(rental, type) {
        const item = window.KinshipStorage.getItem(rental.itemId);
        const owner = window.KinshipStorage.getUser(item?.ownerId);

        if (!item) {
            return `
                <div class="rental-card error">
                    <p>Item not found</p>
                </div>
            `;
        }

        const imageUrl = item.images && item.images.length > 0
            ? item.images[0]
            : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop';

        const statusClass = this.getRentalStatusClass(rental.status);
        const canReview = type === 'past' && rental.status === 'completed' && !rental.reviewed;

        return `
            <div class="rental-card" data-rental-id="${rental.id}">
                <div class="rental-image">
                    <img src="${imageUrl}" alt="${item.title}" loading="lazy">
                </div>
                <div class="rental-content">
                    <h4 class="rental-title">${item.title}</h4>
                    <p class="rental-owner">Owner: ${owner?.profile.name || 'Unknown'}</p>
                    <div class="rental-dates">
                        <span>From: ${window.KinshipUtils.formatDate(rental.startDate)}</span>
                        <span>To: ${window.KinshipUtils.formatDate(rental.endDate)}</span>
                    </div>
                    <div class="rental-price">
                        Total: ${window.KinshipUtils.formatCurrency(rental.totalPrice)}
                    </div>
                    <div class="rental-status ${statusClass}">
                        ${this.formatRentalStatus(rental.status)}
                    </div>
                    ${canReview ? `
                        <div class="rental-actions">
                            <button class="btn-primary" onclick="profileManager.showReviewModal('${rental.id}')">
                                Leave Review
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    loadUserFavorites() {
        const container = document.getElementById('favorite-items');
        if (!container) return;

        const favoriteIds = window.KinshipStorage.getFavorites(this.currentUser.id);

        if (favoriteIds.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"></div>
                    <h3>No favorites yet</h3>
                    <p>Save items you're interested in to view them here.</p>
                    <a href="browse.html" class="btn-primary">Browse Items</a>
                </div>
            `;
            return;
        }

        const favoriteItems = favoriteIds
            .map(id => window.KinshipStorage.getItem(id))
            .filter(item => item !== null);

        if (favoriteItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"></div>
                    <h3>Favorite items not found</h3>
                    <p>Some of your favorite items may no longer be available.</p>
                </div>
            `;
            return;
        }

        // Create container for favorite items
        container.innerHTML = '';

        favoriteItems.forEach(item => {
            const itemCard = new window.Components.ItemCard(item, {
                showFavorite: true,
                clickable: true
            });
            const cardElement = itemCard.render();
            container.appendChild(cardElement);
        });

        // Listen for favorite toggle events to update the display
        window.addEventListener('favoriteToggled', (e) => {
            const { itemId, isFavorited } = e.detail;
            if (!isFavorited) {
                // Item was removed from favorites, refresh the favorites display
                this.loadUserFavorites();
            }
        });
    }

    loadUserReviews() {
        const writtenContainer = document.getElementById('written-reviews');
        const receivedContainer = document.getElementById('received-reviews');

        if (!writtenContainer || !receivedContainer) return;

        // Load reviews written by the user
        this.loadWrittenReviews(writtenContainer);

        // Load reviews received for user's items
        this.loadReceivedReviews(receivedContainer);
    }

    loadWrittenReviews(container) {
        const writtenReviews = window.KinshipStorage.getReviews({ reviewerId: this.currentUser.id });

        if (writtenReviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <p>You haven't written any reviews yet.</p>
                    <p>Complete a rental to leave your first review!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        writtenReviews.forEach(review => {
            const reviewCard = new window.Components.ReviewCard(review, {
                showItemInfo: true,
                showActions: true,
                currentUserId: this.currentUser.id
            });
            container.appendChild(reviewCard.render());
        });
    }

    loadReceivedReviews(container) {
        // Get all user's items
        const userItems = window.KinshipStorage.getItems({ ownerId: this.currentUser.id });
        const userItemIds = userItems.map(item => item.id);

        // Get all reviews for user's items
        const receivedReviews = [];
        userItemIds.forEach(itemId => {
            const itemReviews = window.KinshipStorage.getReviews({ itemId });
            receivedReviews.push(...itemReviews);
        });

        if (receivedReviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <p>No reviews for your items yet.</p>
                    <p>List items and complete rentals to receive reviews!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        receivedReviews.forEach(review => {
            const reviewCard = new window.Components.ReviewCard(review, {
                showItemInfo: true,
                showActions: false,
                currentUserId: this.currentUser.id
            });
            container.appendChild(reviewCard.render());
        });
    }

    populateSettingsForm() {
        const form = document.getElementById('settings-form');
        if (!form) return;

        const user = this.currentUser;
        const fields = {
            'settings-name': user.profile.name,
            'settings-email': user.email,
            'settings-phone': user.profile.phone || '',
            'settings-location': user.profile.location || '',
            'settings-bio': user.profile.bio || ''
        };

        Object.entries(fields).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field) field.value = value;
        });
    }

    handleSettingsUpdate(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            // Update user profile
            const updatedUser = {
                ...this.currentUser,
                email: formData.get('email'),
                profile: {
                    ...this.currentUser.profile,
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    location: formData.get('location'),
                    bio: formData.get('bio')
                }
            };

            // Save to storage
            const saved = window.KinshipStorage.saveUser(updatedUser);

            if (saved) {
                this.currentUser = updatedUser;
                window.KinshipAuth.currentUser = updatedUser;
                this.populateProfileInfo();
                window.KinshipUtils.showToast('Profile updated successfully!', 'success');
            } else {
                window.KinshipUtils.showToast('Error updating profile. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Settings update error:', error);
            window.KinshipUtils.showToast('An unexpected error occurred.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    showEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (!modal) return;

        // Populate form with current data
        const nameField = document.getElementById('edit-name');
        const bioField = document.getElementById('edit-bio');

        if (nameField) nameField.value = this.currentUser.profile.name;
        if (bioField) bioField.value = this.currentUser.profile.bio || '';

        // Show modal
        modal.classList.add('active');
        modal.style.display = 'flex';

        // Focus on first field
        if (nameField) {
            setTimeout(() => nameField.focus(), 100);
        }
    }

    hideEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    }

    handleProfileEdit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            const updatedUser = {
                ...this.currentUser,
                profile: {
                    ...this.currentUser.profile,
                    name: formData.get('name'),
                    bio: formData.get('bio')
                }
            };

            const saved = window.KinshipStorage.saveUser(updatedUser);

            if (saved) {
                this.currentUser = updatedUser;
                window.KinshipAuth.currentUser = updatedUser;
                this.populateProfileInfo();
                this.hideEditProfileModal();
                window.KinshipUtils.showToast('Profile updated successfully!', 'success');
            } else {
                window.KinshipUtils.showToast('Error updating profile. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Profile edit error:', error);
            window.KinshipUtils.showToast('An unexpected error occurred.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    // Listing management methods
    editListing(itemId) {
        window.location.href = `list-item.html?edit=${itemId}`;
    }

    viewListing(itemId) {
        window.location.href = `item-detail.html?id=${itemId}`;
    }

    deleteListing(itemId) {
        console.log('Attempting to delete listing with ID:', itemId);
        
        // Ensure itemId is a string for consistent comparison
        itemId = String(itemId);
        
        const item = window.KinshipStorage.getItem(itemId);
        console.log('Item found:', item);
        
        if (!item) {
            console.error('Item not found for deletion');
            window.KinshipUtils.showToast('Item not found', 'error');
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`);

        if (confirmed) {
            try {
                // Get all items and filter out the one to delete
                const allItems = window.KinshipStorage.getItems() || [];
                const filteredItems = allItems.filter(i => String(i.id) !== String(itemId));
                
                console.log('Items before deletion:', allItems.length);
                console.log('Items after filtering:', filteredItems.length);
                
                // Save the filtered items back to storage
                const saved = window.KinshipStorage.saveData('kinship_items', filteredItems);
                
                if (saved) {
                    window.KinshipUtils.showToast('Listing deleted successfully', 'success');
                    // Reload the listings to reflect the change
                    this.loadUserListings();
                    this.updateUserStats();
                } else {
                    window.KinshipUtils.showToast('Error deleting listing. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                window.KinshipUtils.showToast('An error occurred while deleting the listing', 'error');
            }
        }
    }

    // Helper methods
    getRentalStatusClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'active': 'status-active',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return statusClasses[status] || 'status-unknown';
    }

    formatRentalStatus(status) {
        const statusLabels = {
            'pending': 'Pending Approval',
            'confirmed': 'Confirmed',
            'active': 'Active Rental',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusLabels[status] || status;
    }

    loadBookingRequests() {
        const pendingContainer = document.getElementById('pending-bookings');
        const allContainer = document.getElementById('all-bookings');

        if (!pendingContainer || !allContainer) return;

        // Get all bookings where current user is the owner
        const allBookings = window.KinshipBooking.getUserBookings(this.currentUser.id, 'owner');
        const pendingBookings = allBookings.filter(booking => booking.status === 'pending');

        // Display pending bookings
        if (pendingBookings.length === 0) {
            pendingContainer.innerHTML = `
                <div class="empty-state-small">
                    <p>No pending booking requests</p>
                </div>
            `;
        } else {
            pendingContainer.innerHTML = pendingBookings.map(booking =>
                this.createBookingRequestCard(booking, true)).join('');
        }

        // Display all bookings
        if (allBookings.length === 0) {
            allContainer.innerHTML = `
                <div class="empty-state-small">
                    <p>No booking requests yet</p>
                </div>
            `;
        } else {
            allContainer.innerHTML = allBookings.map(booking =>
                this.createBookingRequestCard(booking, false)).join('');
        }
    }

    createBookingRequestCard(booking, showActions = false) {
        const formattedBooking = window.KinshipBooking.formatBookingForDisplay(booking);
        const { item, renter } = formattedBooking;

        if (!item || !renter) {
            return `
                <div class="booking-request-card error">
                    <p>Booking data incomplete</p>
                </div>
            `;
        }

        const statusClass = this.getRentalStatusClass(booking.status);
        const imageUrl = item.images && item.images.length > 0
            ? item.images[0]
            : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop';

        return `
            <div class="booking-request-card" data-booking-id="${booking.id}">
                <div class="booking-item-info">
                    <img src="${imageUrl}" alt="${item.title}" class="booking-item-image">
                    <div class="booking-details">
                        <h4>${item.title}</h4>
                        <p class="renter-info">Requested by: <strong>${renter.profile.name}</strong></p>
                        <div class="booking-dates">
                            <span>📅 ${formattedBooking.formattedStartDate} - ${formattedBooking.formattedEndDate}</span>
                        </div>
                        <div class="booking-price">
                            <span class="booking-price-icon">💰</span> ${formattedBooking.formattedPrice}</span>
                        </div>
                        ${booking.message ? `
                            <div class="booking-message">
                                <p><strong>Message:</strong> ${booking.message}</p>
                            </div>
                        ` : ''}
                        <div class="booking-status ${statusClass}">
                            ${formattedBooking.statusLabel}
                        </div>
                        <div class="booking-timestamp">
                            Requested: ${window.KinshipUtils?.formatDate(booking.createdAt) || booking.createdAt}
                        </div>
                    </div>
                </div>
                
                ${showActions && booking.status === 'pending' ? `
                    <div class="booking-actions">
                        <button class="btn-success" onclick="profileManager.approveBooking('${booking.id}')">
                            ✓ Approve
                        </button>
                        <button class="btn-danger" onclick="profileManager.rejectBooking('${booking.id}')">
                            ✗ Decline
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    approveBooking(bookingId) {
        const confirmed = confirm('Are you sure you want to approve this booking request?');

        if (confirmed) {
            const result = window.KinshipBooking.confirmBooking(bookingId, 'Booking approved by owner');

            if (result.success) {
                window.KinshipUtils?.showToast('Booking approved successfully!', 'success');
                this.loadBookingRequests(); // Refresh the list
            } else {
                window.KinshipUtils?.showToast(`Error approving booking: ${result.error}`, 'error');
            }
        }
    }

    rejectBooking(bookingId) {
        const reason = prompt('Please provide a reason for declining this booking (optional):');

        if (reason !== null) { // User didn't cancel
            const result = window.KinshipBooking.rejectBooking(bookingId, reason || 'Booking declined by owner');

            if (result.success) {
                window.KinshipUtils?.showToast('Booking declined.', 'success');
                this.loadBookingRequests(); // Refresh the list
            } else {
                window.KinshipUtils?.showToast(`Error declining booking: ${result.error}`, 'error');
            }
        }
    }

    generateRandomAvatar(email, style = 'avataaars') {
        // Generate a consistent avatar based on email
        const seed = email || Math.random().toString();
        const styles = {
            'avataaars': 'avataaars',
            'personas': 'personas',
            'bottts': 'bottts',
            'identicon': 'identicon'
        };

        const selectedStyle = styles[style] || 'avataaars';
        const backgroundColor = 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';

        return `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}`;
    }

    setupAvatarChange() {
        const avatarContainer = document.getElementById('profile-avatar-container');
        const avatarModal = document.getElementById('change-avatar-modal');
        const closeModalBtn = document.getElementById('close-avatar-modal');
        const avatarPreview = document.getElementById('avatar-preview-img');
        const generateNewBtn = document.getElementById('generate-new-avatar');
        const saveAvatarBtn = document.getElementById('save-avatar');
        const styleButtons = document.querySelectorAll('.avatar-style-btn');

        if (!avatarContainer || !avatarModal) return;

        // Store current avatar state as class properties for consistency
        this.currentAvatarStyle = 'avataaars';
        this.currentAvatarSeed = this.currentUser?.email || Math.random().toString();

        // Open modal when clicking on avatar
        avatarContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showAvatarModal();
        });

        // Close modal
        closeModalBtn?.addEventListener('click', () => {
            this.hideAvatarModal();
        });

        avatarModal.addEventListener('click', (e) => {
            if (e.target === avatarModal) {
                this.hideAvatarModal();
            }
        });

        // Style selection
        styleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                styleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentAvatarStyle = btn.dataset.style;
                this.updateAvatarPreview(this.currentAvatarStyle, this.currentAvatarSeed);
            });
        });

        // Generate new avatar
        generateNewBtn?.addEventListener('click', () => {
            this.currentAvatarSeed = Math.random().toString();
            this.updateAvatarPreview(this.currentAvatarStyle, this.currentAvatarSeed);
        });

        // Save avatar
        saveAvatarBtn?.addEventListener('click', () => {
            this.saveNewAvatar(this.currentAvatarStyle, this.currentAvatarSeed);
        });
    }

    showAvatarModal() {
        const modal = document.getElementById('change-avatar-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Force reflow to ensure display change is applied
            modal.offsetHeight;
            modal.classList.add('active');

            // Reset to default style and ensure we have a consistent seed
            this.currentAvatarStyle = 'avataaars';
            if (!this.currentAvatarSeed) {
                this.currentAvatarSeed = this.currentUser?.email || Math.random().toString();
            }

            // Set active style button
            const styleButtons = document.querySelectorAll('.avatar-style-btn');
            styleButtons.forEach(btn => btn.classList.remove('active'));
            const defaultBtn = document.querySelector('[data-style="avataaars"]');
            if (defaultBtn) {
                defaultBtn.classList.add('active');
            }

            // Initialize preview with consistent seed and style
            this.updateAvatarPreview(this.currentAvatarStyle, this.currentAvatarSeed);
        }
    }

    hideAvatarModal() {
        const modal = document.getElementById('change-avatar-modal');
        if (modal) {
            modal.classList.remove('active');
            // Wait for transition to complete before hiding
            setTimeout(() => {
                if (!modal.classList.contains('active')) {
                    modal.style.display = 'none';
                }
            }, 300);
        }
    }

    updateAvatarPreview(style, seed) {
        const preview = document.getElementById('avatar-preview-img');
        if (preview) {
            console.log('Updating avatar preview with style:', style, 'seed:', seed);

            // Add loading state
            preview.style.opacity = '0.5';

            const avatarUrl = this.generateRandomAvatar(seed, style);
            console.log('Generated avatar URL:', avatarUrl);

            // Store the current preview URL for consistency
            this.currentPreviewUrl = avatarUrl;

            // Create new image to preload
            const img = new Image();
            img.onload = () => {
                preview.src = avatarUrl;
                preview.style.opacity = '1';
            };
            img.onerror = () => {
                console.error('Failed to load avatar preview:', avatarUrl);
                preview.style.opacity = '1';
            };
            img.src = avatarUrl;
        }
    }

    saveNewAvatar(style, seed) {
        if (!this.currentUser) return;

        const saveBtn = document.getElementById('save-avatar');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
        }

        // Use the exact same URL that's shown in preview
        const newAvatarUrl = this.currentPreviewUrl || this.generateRandomAvatar(seed, style);
        console.log('Saving avatar with URL:', newAvatarUrl);

        // Update user profile
        const updatedUser = {
            ...this.currentUser,
            profile: {
                ...this.currentUser.profile,
                avatar: newAvatarUrl
            }
        };

        // Save to storage
        const saved = window.KinshipStorage.saveUser(updatedUser);

        if (saved) {
            this.currentUser = updatedUser;
            window.KinshipAuth.currentUser = updatedUser;

            // Update avatar display with the exact same URL
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar) {
                userAvatar.src = newAvatarUrl;
                console.log('Updated profile avatar with URL:', newAvatarUrl);
            }

            this.hideAvatarModal();
            window.KinshipUtils?.showToast('Avatar updated successfully!', 'success');
        } else {
            window.KinshipUtils?.showToast('Error updating avatar. Please try again.', 'error');
        }

        // Reset button state
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Avatar';
        }
    }

    showReviewModal(rentalId) {
        // This would show a review modal - placeholder for now
        window.KinshipUtils?.showToast('Review functionality coming soon!', 'info');
    }


}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, checking if on profile page...');
    console.log('Current pathname:', window.location.pathname);

    // Only initialize on profile page
    if (window.location.pathname.includes('profile.html') || window.location.pathname.endsWith('profile')) {
        console.log('Initializing ProfileManager...');
        try {
            window.profileManager = new ProfileManager();
            console.log('ProfileManager initialized successfully');
        } catch (error) {
            console.error('Error initializing ProfileManager:', error);
        }
    } else {
        console.log('Not on profile page, skipping ProfileManager initialization');
    }
});

// Also try immediate initialization if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
    console.log('DOM is still loading, waiting for DOMContentLoaded...');
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing immediately...');
    if (window.location.pathname.includes('profile.html') || window.location.pathname.endsWith('profile')) {
        try {
            window.profileManager = new ProfileManager();
        } catch (error) {
            console.error('Error initializing ProfileManager immediately:', error);
        }
    }
}

// Export for global access
window.ProfileManager = ProfileManager;

// Manual tab initialization function for debugging
window.initProfileTabs = function () {
    console.log('Manual tab initialization called');

    const tabButtons = document.querySelectorAll('.profile-tabs .tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    console.log('Found', tabButtons.length, 'tab buttons');
    console.log('Found', tabPanels.length, 'tab panels');

    if (tabButtons.length === 0) {
        console.error('No tab buttons found!');
        return;
    }

    // Set initial active states
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
    });

    if (tabButtons[0]) {
        tabButtons[0].classList.add('active');
    }
    if (tabPanels[0]) {
        tabPanels[0].classList.add('active');
        tabPanels[0].style.display = 'block';
    }

    // Add click handlers
    tabButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button.dataset.tab);

        // Remove existing listeners
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelectorAll('.profile-tabs .tab-btn')[index];

        newButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const targetTab = this.dataset.tab;
            console.log('Tab clicked:', targetTab);

            // Remove active from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });

            // Add active to clicked
            this.classList.add('active');

            const targetPanel = document.getElementById(`${targetTab}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.style.display = 'block';
                console.log('Panel activated:', targetPanel.id);
            } else {
                console.error('Panel not found:', `${targetTab}-panel`);
            }
        });
    });

    console.log('Manual tab initialization complete');
};