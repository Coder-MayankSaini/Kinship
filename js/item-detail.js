// Item Detail Page Functionality
class ItemDetailPage {
    constructor() {
        this.currentItem = null;
        this.currentUser = null;
        this.selectedDates = { start: null, end: null };
        this.init();
    }

    init() {
        this.currentUser = this.getCurrentUser();
        this.loadItemFromURL();
        this.setupEventListeners();
    }

    loadItemFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('id');
        
        console.log('[ItemDetailPage] Loading item with ID:', itemId);
        
        if (!itemId) {
            this.showError('Item not found');
            return;
        }

        // Try to get item, handling both string and number IDs
        this.currentItem = window.KinshipStorage ? window.KinshipStorage.getItem(itemId) : null;
        
        // If not found, try converting ID to number
        if (!this.currentItem && !isNaN(itemId)) {
            this.currentItem = window.KinshipStorage ? window.KinshipStorage.getItem(parseInt(itemId)) : null;
        }
        
        // If still not found, try converting ID to string
        if (!this.currentItem) {
            this.currentItem = window.KinshipStorage ? window.KinshipStorage.getItem(String(itemId)) : null;
        }
        
        if (!this.currentItem) {
            console.error('[ItemDetailPage] Item not found for ID:', itemId);
            const items = window.KinshipStorage ? window.KinshipStorage.getItems() : [];
            console.log('[ItemDetailPage] Available items:', items.map(i => ({ id: i.id, title: i.title })));
            this.showError('Item not found');
            return;
        }
        
        console.log('[ItemDetailPage] Item loaded successfully:', this.currentItem.title);

        this.renderItemDetails();
        this.renderOwnerInfo();
        this.renderReviews();
        this.setupImageGallery();
        this.setupAvailabilityCalendar();
        this.updateFavoriteButton();
    }

    renderItemDetails() {
        const item = this.currentItem;
        
        // Update page title and breadcrumb
        document.title = `${item.title} - Kinship`;
        document.getElementById('item-title-breadcrumb').textContent = item.title;
        
        // Update item information
        document.getElementById('item-title').textContent = item.title;
        document.getElementById('item-description-text').textContent = item.description;
        document.getElementById('item-price').textContent = `₹${item.pricing.daily}/day`;
        document.getElementById('weekly-price').textContent = `₹${item.pricing.weekly}/week`;
        
        // Update rating
        this.updateRatingDisplay('item-stars', 'rating-count', item.rating || 0, item.reviewCount || 0);
        
        // Update main image
        const mainImage = document.getElementById('main-item-image');
        if (item.images && item.images.length > 0) {
            mainImage.src = item.images[0];
            mainImage.alt = item.title;
        }
        
        // Update specifications
        this.renderSpecifications(item);
    }

    renderSpecifications(item) {
        const specsContainer = document.getElementById('item-specs');
        const specs = [
            { label: 'Category', value: item.category },
            { label: 'Location', value: item.location },
            { label: 'Condition', value: item.condition || 'Good' },
            { label: 'Available Since', value: this.formatDate(item.createdAt) }
        ];
        
        specsContainer.innerHTML = specs.map(spec => 
            `<div class="spec-item">
                <span class="spec-label">${spec.label}:</span>
                <span class="spec-value">${spec.value}</span>
            </div>`
        ).join('');
    }

    setupImageGallery() {
        const item = this.currentItem;
        if (!item.images || item.images.length <= 1) return;
        
        const thumbnailContainer = document.getElementById('thumbnail-images');
        const mainImage = document.getElementById('main-item-image');
        
        thumbnailContainer.innerHTML = item.images.map((image, index) => 
            `<img src="${image}" alt="${item.title} ${index + 1}" 
                  class="thumbnail ${index === 0 ? 'active' : ''}" 
                  data-index="${index}">`
        ).join('');
        
        // Add click handlers for thumbnails
        thumbnailContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('thumbnail')) {
                const index = parseInt(e.target.dataset.index);
                mainImage.src = item.images[index];
                
                // Update active thumbnail
                thumbnailContainer.querySelectorAll('.thumbnail').forEach(thumb => 
                    thumb.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    renderOwnerInfo() {
        const owner = window.KinshipStorage ? window.KinshipStorage.getUser(this.currentItem.ownerId) : null;
        if (!owner) {
            // Show placeholder if no owner found
            const ownerCard = document.getElementById('owner-card');
            ownerCard.innerHTML = `
                <div class="owner-avatar">
                    <img src="https://ui-avatars.com/api/?name=Owner&background=d4a751&color=2d1b0e&size=120" 
                         alt="Owner">
                </div>
                <div class="owner-info">
                    <h3>Item Owner</h3>
                    <div class="owner-rating">
                        <span class="stars">${this.generateStars(0)}</span>
                        <span class="rating-text">No rating</span>
                    </div>
                    <p class="member-since">Member information not available</p>
                    <p class="owner-bio">Contact the owner for more information about this item.</p>
                </div>
            `;
            return;
        }
        
        const ownerCard = document.getElementById('owner-card');
        const avatarUrl = owner.profile.avatar || 
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.profile.name || 'User')}&background=d4a751&color=2d1b0e&size=120`;
        
        ownerCard.innerHTML = `
            <div class="owner-avatar">
                <img src="${avatarUrl}" 
                     alt="${owner.profile.name || 'Owner'}" 
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(owner.profile.name || 'User')}&background=d4a751&color=2d1b0e&size=120'">
            </div>
            <div class="owner-info">
                <h3>${owner.profile.name || 'Anonymous User'}</h3>
                <div class="owner-rating">
                    <span class="stars">${this.generateStars(owner.profile.rating || 0)}</span>
                    <span class="rating-text">${(owner.profile.rating || 0).toFixed(1)}/5</span>
                </div>
                <p class="member-since">Member since ${this.formatDate(owner.createdAt || owner.profile.joinDate)}</p>
                <p class="owner-bio">${owner.profile.bio || 'No bio available'}</p>
            </div>
        `;
    }

    renderReviews() {
        const reviewsContainer = document.getElementById('reviews-section');
        if (!reviewsContainer) return;

        // Clear existing content
        reviewsContainer.innerHTML = '';
        
        // Add section title
        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = 'Customer Reviews';
        sectionTitle.style.fontSize = '28px';
        sectionTitle.style.fontWeight = '700';
        sectionTitle.style.color = '#1f2937';
        sectionTitle.style.marginBottom = '24px';
        sectionTitle.style.textTransform = 'uppercase';
        sectionTitle.style.letterSpacing = '0.5px';
        reviewsContainer.appendChild(sectionTitle);

        // Get reviews
        const reviews = window.KinshipStorage ? window.KinshipStorage.getReviews({ itemId: this.currentItem.id }) : [];
        
        if (!reviews || reviews.length === 0) {
            // Show "No Reviews" message
            const noReviewsDiv = document.createElement('div');
            noReviewsDiv.className = 'no-reviews';
            noReviewsDiv.innerHTML = `
                <h3>No Reviews Yet</h3>
                <p>Be the first to review this item!</p>
                ${this.currentUser ? 
                    '<button class="rent-now-btn" style="margin-top: 20px; padding: 12px 24px;" onclick="window.dispatchEvent(new CustomEvent(\'writeReview\', { detail: { itemId: \'' + this.currentItem.id + '\' }}))">Write a Review</button>' : 
                    '<p style="margin-top: 20px; font-size: 14px; color: #9ca3af;">Log in to write a review</p>'
                }
            `;
            reviewsContainer.appendChild(noReviewsDiv);
        } else {
            // Try to create review summary if Components is available
            if (window.Components && window.Components.ReviewSummary) {
                const reviewSummary = new window.Components.ReviewSummary(this.currentItem.id, {
                    showWriteReview: true,
                    currentUserId: this.currentUser?.id
                });
                reviewsContainer.appendChild(reviewSummary.render());
            }
            
            // Create reviews list
            const reviewsList = document.createElement('div');
            reviewsList.className = 'reviews-list';
            
            reviews.forEach(review => {
                if (window.Components && window.Components.ReviewCard) {
                    const reviewCard = new window.Components.ReviewCard(review, {
                        showActions: this.currentUser?.id === review.reviewerId,
                        currentUserId: this.currentUser?.id
                    });
                    reviewsList.appendChild(reviewCard.render());
                } else {
                    // Fallback simple review display
                    const simpleReview = document.createElement('div');
                    simpleReview.className = 'review-card';
                    simpleReview.innerHTML = `
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-name">${review.reviewerName || 'Anonymous'}</div>
                                <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                        </div>
                        <div class="review-content">${review.comment || 'No comment provided'}</div>
                    `;
                    reviewsList.appendChild(simpleReview);
                }
            });
            
            reviewsContainer.appendChild(reviewsList);
        }

        // Setup review form modal
        this.setupReviewModal();
    }

    setupReviewModal() {
        // Listen for write review events
        window.addEventListener('writeReview', (event) => {
            if (event.detail.itemId === this.currentItem.id) {
                this.openReviewModal();
            }
        });

        // Listen for review events
        window.addEventListener('reviewDeleted', () => {
            this.renderReviews(); // Refresh reviews display
        });
    }

    openReviewModal() {
        if (!this.currentUser) {
            alert('Please log in to write a review');
            return;
        }

        // Check if user can review this item
        const canReview = window.KinshipStorage.canUserReview(this.currentUser.id, this.currentItem.id);
        
        if (!canReview.canReview) {
            alert(canReview.reason);
            return;
        }

        // Find a completed booking to associate with the review
        const completedBooking = canReview.bookings[0]; // Use the first completed booking

        // Create review form
        const reviewForm = new window.Components.ReviewForm({
            itemId: this.currentItem.id,
            bookingId: completedBooking.id,
            onSubmit: (reviewData) => {
                this.handleReviewSubmit(reviewData);
            },
            onCancel: () => {
                this.closeReviewModal();
            }
        });

        // Create modal
        const modal = new window.Components.Modal({
            title: `Review ${this.currentItem.title}`,
            content: '',
            className: 'review-modal'
        });

        modal.create();
        modal.setContent(reviewForm.render().outerHTML);
        modal.open();

        // Store modal reference for closing
        this.currentReviewModal = modal;

        // Re-attach event listeners after setting content
        const modalElement = modal.element;
        const formElement = modalElement.querySelector('.review-form');
        const newReviewForm = new window.Components.ReviewForm({
            itemId: this.currentItem.id,
            bookingId: completedBooking.id,
            onSubmit: (reviewData) => {
                this.handleReviewSubmit(reviewData);
            },
            onCancel: () => {
                this.closeReviewModal();
            }
        });

        // Replace the form content with properly attached event listeners
        formElement.replaceWith(newReviewForm.render());
    }

    handleReviewSubmit(reviewData) {
        // Close modal
        this.closeReviewModal();
        
        // Refresh reviews display
        this.renderReviews();
        
        // Refresh item details to show updated rating
        this.currentItem = window.KinshipStorage.getItem(this.currentItem.id);
        this.updateRatingDisplay('item-stars', 'rating-count', this.currentItem.rating, this.currentItem.reviewCount);
    }

    closeReviewModal() {
        if (this.currentReviewModal) {
            this.currentReviewModal.close();
            setTimeout(() => {
                this.currentReviewModal.destroy();
                this.currentReviewModal = null;
            }, 300);
        }
    }

    setupAvailabilityCalendar() {
        // Use the new MultiDatePicker for multiple date selection
        if (window.MultiDatePicker) {
            this.datePicker = new window.MultiDatePicker(
                this.currentItem.id, 
                this.currentItem.availability
            );
        } else if (window.RentalDatePicker) {
            // Fallback to RentalDatePicker
            this.datePicker = new window.RentalDatePicker(
                this.currentItem.id, 
                this.currentItem.availability
            );
        } else {
            // Fallback to simple calendar if neither is available
            const calendarWidget = document.getElementById('calendar-widget');
            const availability = this.currentItem.availability || { type: 'always', dates: [] };
            
            calendarWidget.innerHTML = `
                <div class="availability-message" style="text-align: center; padding: 2rem; background: #f3f4f6; border-radius: 8px;">
                    ${availability.type === 'always' ? 
                        '<strong>✓ This item is available anytime</strong>' : 
                        `<strong>Available on ${availability.dates ? availability.dates.length : 0} specific dates</strong>`}
                </div>
            `;
        }
    }

    generateCalendarDays(year, month, availability) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let days = '';
        const today = new Date();
        
        // Get existing bookings for this item
        const existingBookings = window.KinshipStorage ? window.KinshipStorage.getBookings({ itemId: this.currentItem.id }) : [];
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateString = currentDate.toISOString().split('T')[0];
            const isCurrentMonth = currentDate.getMonth() === month;
            const isPast = currentDate < today;
            const isAvailable = availability.includes(dateString) && !isPast;
            
            // Check if date is booked or pending
            const bookingStatus = this.getDateBookingStatus(dateString, existingBookings);
            
            const classes = [
                'calendar-day',
                isCurrentMonth ? 'current-month' : 'other-month',
                isPast ? 'past' : '',
                bookingStatus === 'booked' ? 'booked' : '',
                bookingStatus === 'pending' ? 'pending' : '',
                (isAvailable && bookingStatus === 'available') ? 'available' : 'unavailable'
            ].filter(Boolean).join(' ');
            
            days += `<div class="${classes}" data-date="${dateString}">
                        ${currentDate.getDate()}
                     </div>`;
        }
        
        return days;
    }

    getDateBookingStatus(dateString, bookings) {
        const date = new Date(dateString);
        
        for (const booking of bookings) {
            if (booking.status === 'cancelled' || booking.status === 'rejected') {
                continue;
            }
            
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            
            if (date >= startDate && date <= endDate) {
                if (booking.status === 'pending') {
                    return 'pending';
                } else if (booking.status === 'confirmed' || booking.status === 'active') {
                    return 'booked';
                }
            }
        }
        
        return 'available';
    }

    setupCalendarInteraction() {
        const calendarGrid = document.querySelector('.calendar-grid');
        
        calendarGrid.addEventListener('click', (e) => {
            if (!e.target.classList.contains('calendar-day') || 
                !e.target.classList.contains('available') ||
                e.target.classList.contains('booked') ||
                e.target.classList.contains('pending')) {
                
                // Show message for unavailable dates
                if (e.target.classList.contains('booked')) {
                    alert('This date is already booked.');
                } else if (e.target.classList.contains('pending')) {
                    alert('This date has a pending booking request.');
                }
                return;
            }
            
            const selectedDate = e.target.dataset.date;
            
            if (!this.selectedDates.start || this.selectedDates.end) {
                // Start new selection
                this.clearDateSelection();
                this.selectedDates.start = selectedDate;
                this.selectedDates.end = null;
                e.target.classList.add('selected', 'start-date');
            } else {
                // Complete selection
                const startDate = new Date(this.selectedDates.start);
                const endDate = new Date(selectedDate);
                
                if (endDate > startDate) {
                    this.selectedDates.end = selectedDate;
                    this.highlightDateRange();
                } else {
                    // If end date is before start date, restart selection
                    this.clearDateSelection();
                    this.selectedDates.start = selectedDate;
                    this.selectedDates.end = null;
                    e.target.classList.add('selected', 'start-date');
                }
            }
        });
    }

    clearDateSelection() {
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected', 'start-date', 'end-date', 'in-range');
        });
    }

    highlightDateRange() {
        const startDate = new Date(this.selectedDates.start);
        const endDate = new Date(this.selectedDates.end);
        
        document.querySelectorAll('.calendar-day').forEach(day => {
            const dayDate = new Date(day.dataset.date);
            
            if (dayDate.getTime() === startDate.getTime()) {
                day.classList.add('selected', 'start-date');
            } else if (dayDate.getTime() === endDate.getTime()) {
                day.classList.add('selected', 'end-date');
            } else if (dayDate > startDate && dayDate < endDate) {
                day.classList.add('selected', 'in-range');
            }
        });
    }

    setupEventListeners() {
        // Favorite button
        const favoriteBtn = document.getElementById('favorite-btn');
        favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        
        // Rent now button
        const rentNowBtn = document.getElementById('rent-now-btn');
        rentNowBtn.addEventListener('click', () => this.openRentalModal());
        
        // Contact owner button
        const contactOwnerBtn = document.getElementById('contact-owner-btn');
        contactOwnerBtn.addEventListener('click', () => this.contactOwner());
        
        // Rental modal
        this.setupRentalModal();
    }

    toggleFavorite() {
        if (!this.currentUser) {
            if (window.KinshipUtils && window.KinshipUtils.showToast) {
                window.KinshipUtils.showToast('Please log in to add favorites', 'info');
            } else {
                alert('Please log in to add favorites');
            }
            return;
        }
        
        const itemId = this.currentItem.id;
        const userId = this.currentUser.id;
        const isFavorited = window.KinshipStorage.isFavorite(userId, itemId);
        
        if (isFavorited) {
            window.KinshipStorage.removeFromFavorites(userId, itemId);
            if (window.KinshipUtils && window.KinshipUtils.showToast) {
                window.KinshipUtils.showToast('Removed from favorites', 'success');
            }
        } else {
            window.KinshipStorage.addToFavorites(userId, itemId);
            if (window.KinshipUtils && window.KinshipUtils.showToast) {
                window.KinshipUtils.showToast('Added to favorites', 'success');
            }
        }
        
        this.updateFavoriteButton();

        // Trigger custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('favoriteToggled', {
            detail: { itemId, isFavorited: !isFavorited }
        }));
    }

    updateFavoriteButton() {
        const favoriteBtn = document.getElementById('favorite-btn');
        
        if (!this.currentUser) {
            favoriteBtn.style.display = 'none';
            return;
        }
        
        const isFavorited = window.KinshipStorage.isFavorite(this.currentUser.id, this.currentItem.id);
        
        favoriteBtn.textContent = isFavorited ? '♥' : '♡';
        favoriteBtn.classList.toggle('favorited', isFavorited);
        favoriteBtn.setAttribute('aria-label', isFavorited ? 'Remove from favorites' : 'Add to favorites');
        favoriteBtn.title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
        favoriteBtn.style.display = 'block';
    }

    openRentalModal() {
        if (!this.currentUser) {
            alert('Please log in to rent items');
            return;
        }
        
        if (this.currentUser.id === this.currentItem.ownerId) {
            alert('You cannot rent your own item');
            return;
        }
        
        const modal = document.getElementById('rental-modal');
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('start-date').min = today;
        document.getElementById('end-date').min = today;
        
        // Check if we have dates selected from the calendar
        if (this.datePicker) {
            if (this.datePicker.getDateRange) {
                // MultiDatePicker - get first and last dates
                const dateRange = this.datePicker.getDateRange();
                if (dateRange.start) {
                    document.getElementById('start-date').value = dateRange.start;
                    document.getElementById('end-date').min = dateRange.start;
                }
                if (dateRange.end) {
                    document.getElementById('end-date').value = dateRange.end;
                }
            } else if (this.datePicker.getSelectedDates) {
                // RentalDatePicker - get start/end dates
                const selectedDates = this.datePicker.getSelectedDates();
                if (selectedDates.start) {
                    document.getElementById('start-date').value = selectedDates.start;
                    document.getElementById('end-date').min = selectedDates.start;
                }
                if (selectedDates.end) {
                    document.getElementById('end-date').value = selectedDates.end;
                }
            }
        }
        
        // Update pricing display
        document.getElementById('daily-rate').textContent = `₹${this.currentItem.pricing.daily}`;
        
        // Trigger cost calculation after modal setup
        setTimeout(() => {
            console.log('Triggering cost calculation from openRentalModal');
            this.updateRentalCost();
        }, 100);
    }

    setupRentalModal() {
        const modal = document.getElementById('rental-modal');
        const closeBtn = modal.querySelector('.close');
        const form = document.getElementById('rental-form');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
        
        // Update cost calculation when dates change
        [startDateInput, endDateInput].forEach(input => {
            input.addEventListener('change', () => this.updateRentalCost());
        });
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitRental();
        });
    }

    updateRentalCost() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        console.log('Updating rental cost with dates:', { startDate, endDate });
        
        if (!startDate || !endDate) {
            console.log('Missing start or end date');
            return;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        console.log('Parsed dates:', { start, end });
        
        // Check if we're using MultiDatePicker with individual dates
        let days;
        if (this.datePicker && this.datePicker.getSelectedDates && this.datePicker.getSelectedDates().length > 0) {
            // Use actual selected dates count from MultiDatePicker
            days = this.datePicker.getSelectedDates().length;
            console.log('Using MultiDatePicker selected dates count:', days);
        } else if (this.datePicker && this.datePicker.selectedDates && this.datePicker.selectedDates.length > 0) {
            // Alternative access to selectedDates
            days = this.datePicker.selectedDates.length;
            console.log('Using MultiDatePicker selectedDates array length:', days);
        } else {
            // Fall back to date range calculation
            days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
            console.log('Using date range calculation:', days);
        }
        
        if (days <= 0) {
            console.log('Days calculation resulted in 0 or negative');
            document.getElementById('rental-days').textContent = '0';
            document.getElementById('total-cost').textContent = '₹0';
            return;
        }
        
        const dailyRate = this.currentItem.pricing.daily;
        const totalCost = days * dailyRate;
        
        console.log('Final calculation:', { days, dailyRate, totalCost });
        
        document.getElementById('rental-days').textContent = days;
        document.getElementById('total-cost').textContent = `₹${totalCost}`;
    }

    submitRental() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (days <= 0) {
            alert('End date must be after start date');
            return;
        }

        // Check if dates are available
        if (!this.checkDateAvailability(startDate, endDate)) {
            alert('Selected dates are not available. Please choose different dates.');
            return;
        }

        // Check for conflicting bookings
        if (this.hasConflictingBookings(startDate, endDate)) {
            alert('These dates conflict with existing bookings. Please choose different dates.');
            return;
        }
        
        const booking = {
            id: generateId(),
            itemId: this.currentItem.id,
            renterId: this.currentUser.id,
            ownerId: this.currentItem.ownerId,
            startDate: startDate,
            endDate: endDate,
            totalPrice: days * this.currentItem.pricing.daily,
            status: 'pending',
            createdAt: new Date().toISOString(),
            message: document.getElementById('rental-message')?.value || ''
        };
        
        // Validate booking data
        if (!window.KinshipValidation.validateBookingData(booking)) {
            alert('Invalid booking data. Please try again.');
            return;
        }

        // Use the booking manager to create the booking
        const result = window.KinshipBooking.createBooking(booking);
        
        if (result.success) {
            // Close modal and show success message
            const modal = document.getElementById('rental-modal');
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Show success notification
            this.showBookingConfirmation(result.booking);
            
            // Refresh calendar to show updated availability
            this.setupAvailabilityCalendar();
        } else {
            alert(`Error creating booking: ${result.error}`);
        }
    }

    checkDateAvailability(startDate, endDate) {
        const availability = this.currentItem.availability || [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Check each day in the range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (!availability.includes(dateString)) {
                return false;
            }
        }
        return true;
    }

    hasConflictingBookings(startDate, endDate) {
        return window.KinshipBooking.hasConflictingBookings(this.currentItem.id, startDate, endDate);
    }

    updateItemAvailability(startDate, endDate, status) {
        // This would typically update the item's availability calendar
        // For now, we'll just track it in the booking system
        console.log(`Marking dates ${startDate} to ${endDate} as ${status} for item ${this.currentItem.id}`);
    }

    showBookingConfirmation(booking) {
        const confirmationHtml = `
            <div class="booking-confirmation">
                <h3>Booking Request Submitted!</h3>
                <p>Your rental request has been sent to the owner.</p>
                <div class="booking-details">
                    <p><strong>Item:</strong> ${this.currentItem.title}</p>
                    <p><strong>Dates:</strong> ${this.formatDate(booking.startDate)} - ${this.formatDate(booking.endDate)}</p>
                    <p><strong>Total:</strong> ₹${booking.totalPrice}</p>
                    <p><strong>Status:</strong> Pending Owner Approval</p>
                </div>
                <p>You'll be notified when the owner responds to your request.</p>
                <button onclick="this.parentElement.remove()" class="btn">Close</button>
            </div>
        `;
        
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = confirmationHtml;
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    contactOwner() {
        if (!this.currentUser) {
            alert('Please log in to contact the owner');
            return;
        }
        
        // Simple implementation - could be enhanced with a messaging system
        const owner = window.KinshipStorage ? window.KinshipStorage.getUser(this.currentItem.ownerId) : null;
        if (owner) {
            alert(`Contact ${owner.profile.name} at: ${owner.email}`);
        } else {
            alert('Owner information not available.');
        }
    }

    updateAuthUI() {
        const rentNowBtn = document.getElementById('rent-now-btn');
        const contactOwnerBtn = document.getElementById('contact-owner-btn');
        
        if (!this.currentUser) {
            rentNowBtn.textContent = 'Login to Rent';
            contactOwnerBtn.textContent = 'Login to Contact';
        } else if (this.currentItem && this.currentUser.id === this.currentItem.ownerId) {
            rentNowBtn.textContent = 'Your Item';
            rentNowBtn.disabled = true;
            contactOwnerBtn.style.display = 'none';
        }
    }

    // Utility methods
    updateRatingDisplay(starsId, countId, rating, reviewCount) {
        document.getElementById(starsId).innerHTML = this.generateStars(rating);
        document.getElementById(countId).textContent = `(${reviewCount} review${reviewCount !== 1 ? 's' : ''})`;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }

    getCurrentUser() {
        // Try multiple ways to get current user
        if (window.KinshipAuth && window.KinshipAuth.getCurrentUser) {
            return window.KinshipAuth.getCurrentUser();
        }
        if (window.KinshipStorage && window.KinshipStorage.getCurrentUser) {
            return window.KinshipStorage.getCurrentUser();
        }
        return null;
    }

    showError(message) {
        const errorHtml = `
            <div class="error-container" style="text-align: center; padding: 60px 20px; background: white; min-height: 400px;">
                <div class="error-icon" style="font-size: 72px; margin-bottom: 24px;">⚠️</div>
                <h2 style="color: #dc2626; font-size: 36px; margin-bottom: 20px; font-weight: bold;">ERROR</h2>
                <p style="font-size: 20px; color: #6b7280; margin-bottom: 40px;">${message}</p>
                
                <div class="error-actions" style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 50px;">
                    <a href="browse.html" class="btn" style="padding: 14px 32px; background-color: #d4a751; color: #2d1b0e; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; border: none;">Browse Items</a>
                    <a href="index.html" class="btn" style="padding: 14px 32px; background-color: #6b7280; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; border: none;">Go Home</a>
                    <button onclick="window.history.back()" class="btn" style="padding: 14px 32px; background-color: white; color: #2563eb; border: 2px solid #2563eb; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer;">Go Back</button>
                </div>
                
                <div class="help-text" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; max-width: 500px; margin-left: auto; margin-right: auto;">
                    <h4 style="color: #374151; margin-bottom: 20px; font-size: 18px; font-weight: 600;">What you can do:</h4>
                    <ul style="text-align: left; color: #6b7280; list-style: none; padding: 0; font-size: 16px; line-height: 1.8;">
                        <li style="margin-bottom: 12px;">✓ Check if you have the correct item link</li>
                        <li style="margin-bottom: 12px;">✓ Browse available items from our catalog</li>
                        <li style="margin-bottom: 12px;">✓ Return to the homepage to start over</li>
                        <li style="margin-bottom: 12px;">✓ Contact support if this problem persists</li>
                    </ul>
                </div>
            </div>`;
        
        // Update the main content area
        const mainContent = document.querySelector('main.item-detail-page');
        if (mainContent) {
            // Clear all content in main
            mainContent.innerHTML = `
                <nav class="breadcrumb" aria-label="Breadcrumb navigation">
                    <ol>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="browse.html">Browse</a></li>
                        <li><span aria-current="page">Item Details</span></li>
                    </ol>
                </nav>
                ${errorHtml}
            `;
        } else {
            // Fallback if main element structure is different
            const itemDetailContent = document.querySelector('.item-detail-content');
            if (itemDetailContent) {
                itemDetailContent.innerHTML = errorHtml;
            }
        }
        
        document.title = 'Item Not Found - Kinship';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.itemDetailPage = new ItemDetailPage();
});
