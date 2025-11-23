/**
 * Reusable UI Components for Kinship Rental Platform
 * Handles creation and management of common UI elements
 */

// ItemCard Component - Display item in grid/list view
class ItemCard {
    constructor(item, options = {}) {
        this.item = item;
        this.options = {
            showFavorite: true,
            clickable: true,
            ...options
        };
    }

    render() {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.itemId = this.item.id;

        const imageUrl = this.item.images && this.item.images.length > 0 
            ? this.item.images[0] 
            : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${this.item.title}" class="item-card-image" loading="lazy">
            ${this.options.showFavorite ? `
                <button class="item-card-favorite" data-item-id="${this.item.id}">
                    <span class="heart-icon">♡</span>
                </button>
            ` : ''}
            <div class="item-card-content">
                <h3 class="item-card-title">${this.item.title}</h3>
                <div class="item-card-price">₹${this.item.pricing.daily}/day</div>
                <div class="item-card-location">${this.item.location}</div>
                <div class="item-card-rating">
                    <span class="item-card-stars">${this.renderStars(this.item.rating || 0)}</span>
                    <span>${(this.item.rating || 0).toFixed(1)} (${this.item.reviewCount || 0})</span>
                </div>
            </div>
        `;

        if (this.options.clickable) {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.item-card-favorite')) {
                    this.handleClick();
                }
            });
        }

        // Handle favorite button
        const favoriteBtn = card.querySelector('.item-card-favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite();
            });
            this.updateFavoriteState(favoriteBtn);
        }

        return card;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '★';
            } else if (i === fullStars && hasHalfStar) {
                stars += '☆';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    handleClick() {
        window.location.href = `item-detail.html?id=${this.item.id}`;
    }

    toggleFavorite() {
        const currentUser = window.KinshipStorage.getCurrentUser();
        if (!currentUser) {
            if (window.KinshipUtils && window.KinshipUtils.showToast) {
                window.KinshipUtils.showToast('Please log in to add favorites', 'info');
            } else {
                alert('Please log in to add favorites');
            }
            return;
        }

        const itemId = this.item.id;
        const userId = currentUser.id;
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

        // Update the visual state
        const button = document.querySelector(`[data-item-id="${itemId}"] .item-card-favorite`);
        if (button) {
            this.updateFavoriteState(button);
        }

        // Trigger custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('favoriteToggled', {
            detail: { itemId, isFavorited: !isFavorited }
        }));
    }

    updateFavoriteState(button) {
        const currentUser = window.KinshipStorage.getCurrentUser();
        if (!currentUser) {
            button.style.display = 'none';
            return;
        }

        const isFavorited = window.KinshipStorage.isFavorite(currentUser.id, this.item.id);
        const heartIcon = button.querySelector('.heart-icon');
        
        if (isFavorited) {
            heartIcon.textContent = '♥';
            button.classList.add('favorited');
            button.setAttribute('aria-label', 'Remove from favorites');
            button.title = 'Remove from favorites';
        } else {
            heartIcon.textContent = '♡';
            button.classList.remove('favorited');
            button.setAttribute('aria-label', 'Add to favorites');
            button.title = 'Add to favorites';
        }
        
        button.style.display = 'block';
    }
}

// Modal Component - Reusable modal dialogs
class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            showCloseButton: true,
            closeOnBackdrop: true,
            className: '',
            ...options
        };
        this.element = null;
        this.isOpen = false;
    }

    create() {
        if (this.element) return this.element;

        this.element = document.createElement('div');
        this.element.className = `modal ${this.options.className}`;
        
        this.element.innerHTML = `
            <div class="modal-content">
                ${this.options.showCloseButton ? '<span class="close">&times;</span>' : ''}
                ${this.options.title ? `<h2>${this.options.title}</h2>` : ''}
                <div class="modal-body">
                    ${this.options.content}
                </div>
            </div>
        `;

        // Add event listeners
        if (this.options.closeOnBackdrop) {
            this.element.addEventListener('click', (e) => {
                if (e.target === this.element) {
                    this.close();
                }
            });
        }

        const closeBtn = this.element.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        document.body.appendChild(this.element);
        return this.element;
    }

    open() {
        if (!this.element) this.create();
        
        this.element.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const focusableElements = this.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        return this;
    }

    close() {
        if (!this.element) return;
        
        this.element.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        return this;
    }

    setContent(content) {
        if (!this.element) this.create();
        
        const modalBody = this.element.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = content;
        }
        return this;
    }

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
            this.isOpen = false;
            document.body.style.overflow = '';
        }
    }
}

// ImageGallery Component - Item image carousel
class ImageGallery {
    constructor(images, options = {}) {
        this.images = images || [];
        this.currentIndex = 0;
        this.options = {
            showThumbnails: true,
            autoHeight: false,
            ...options
        };
    }

    render() {
        const gallery = document.createElement('div');
        gallery.className = 'image-gallery';

        if (this.images.length === 0) {
            gallery.innerHTML = `
                <div class="main-image">
                    <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop" 
                         alt="No image available" />
                </div>
            `;
            return gallery;
        }

        gallery.innerHTML = `
            <div class="main-image">
                <img src="${this.images[0]}" alt="Item image" id="main-gallery-image">
                ${this.images.length > 1 ? `
                    <button class="gallery-nav prev" data-direction="prev">‹</button>
                    <button class="gallery-nav next" data-direction="next">›</button>
                ` : ''}
            </div>
            ${this.options.showThumbnails && this.images.length > 1 ? `
                <div class="thumbnail-images">
                    ${this.images.map((image, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <img src="${image}" alt="Thumbnail ${index + 1}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        this.attachEventListeners(gallery);
        return gallery;
    }

    attachEventListeners(gallery) {
        // Navigation buttons
        const prevBtn = gallery.querySelector('.gallery-nav.prev');
        const nextBtn = gallery.querySelector('.gallery-nav.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigate(-1, gallery));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigate(1, gallery));
        }

        // Thumbnail clicks
        const thumbnails = gallery.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.goToImage(index, gallery));
        });

        // Keyboard navigation
        gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigate(-1, gallery);
            if (e.key === 'ArrowRight') this.navigate(1, gallery);
        });

        // Make gallery focusable for keyboard navigation
        gallery.setAttribute('tabindex', '0');
    }

    navigate(direction, gallery) {
        const newIndex = this.currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.images.length) {
            this.goToImage(newIndex, gallery);
        }
    }

    goToImage(index, gallery) {
        this.currentIndex = index;
        
        const mainImage = gallery.querySelector('#main-gallery-image');
        const thumbnails = gallery.querySelectorAll('.thumbnail');
        
        if (mainImage) {
            mainImage.src = this.images[index];
        }
        
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
}

// FilterSidebar Component - Search filters
class FilterSidebar {
    constructor(options = {}) {
        this.options = {
            categories: ['Electronics', 'Tools', 'Sports', 'Home & Garden', 'Vehicles', 'Other'],
            priceRange: { min: 0, max: 500 },
            onFilterChange: () => {},
            ...options
        };
        this.filters = {
            categories: [],
            priceMin: this.options.priceRange.min,
            priceMax: this.options.priceRange.max,
            location: '',
            rating: 0
        };
    }

    render() {
        const sidebar = document.createElement('div');
        sidebar.className = 'filter-sidebar';
        
        sidebar.innerHTML = `
            <h3>Filters</h3>
            
            <div class="filter-group">
                <h4>Categories</h4>
                <div class="filter-options">
                    ${this.options.categories.map(category => `
                        <label>
                            <input type="checkbox" name="category" value="${category}">
                            <span>${category}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="filter-group">
                <h4>Price Range</h4>
                <div class="price-range">
                    <div class="price-labels">
                        <span>₹${this.options.priceRange.min}</span>
                        <span>₹${this.options.priceRange.max}</span>
                    </div>
                    <input type="range" 
                           id="price-min" 
                           min="${this.options.priceRange.min}" 
                           max="${this.options.priceRange.max}" 
                           value="${this.options.priceRange.min}">
                    <input type="range" 
                           id="price-max" 
                           min="${this.options.priceRange.min}" 
                           max="${this.options.priceRange.max}" 
                           value="${this.options.priceRange.max}">
                </div>
            </div>

            <div class="filter-group">
                <h4>Location</h4>
                <div class="filter-options">
                    <input type="text" 
                           id="location-filter" 
                           placeholder="Enter city or zip code"
                           class="form-input">
                </div>
            </div>

            <div class="filter-group">
                <h4>Minimum Rating</h4>
                <div class="filter-options">
                    ${[4, 3, 2, 1].map(rating => `
                        <label>
                            <input type="radio" name="rating" value="${rating}">
                            <span>${'★'.repeat(rating)}${'☆'.repeat(5-rating)} & up</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <button class="clear-filters">Clear All Filters</button>
        `;

        this.attachEventListeners(sidebar);
        return sidebar;
    }

    attachEventListeners(sidebar) {
        // Category checkboxes
        const categoryInputs = sidebar.querySelectorAll('input[name="category"]');
        categoryInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateCategoryFilter();
                this.options.onFilterChange(this.getFilters());
            });
        });

        // Price range sliders
        const priceMin = sidebar.querySelector('#price-min');
        const priceMax = sidebar.querySelector('#price-max');
        
        if (priceMin && priceMax) {
            [priceMin, priceMax].forEach(slider => {
                slider.addEventListener('input', () => {
                    this.updatePriceFilter(priceMin.value, priceMax.value);
                    this.options.onFilterChange(this.getFilters());
                });
            });
        }

        // Location input
        const locationInput = sidebar.querySelector('#location-filter');
        if (locationInput) {
            locationInput.addEventListener('input', (e) => {
                this.filters.location = e.target.value;
                this.options.onFilterChange(this.getFilters());
            });
        }

        // Rating radio buttons
        const ratingInputs = sidebar.querySelectorAll('input[name="rating"]');
        ratingInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.filters.rating = parseInt(input.value);
                this.options.onFilterChange(this.getFilters());
            });
        });

        // Clear filters button
        const clearBtn = sidebar.querySelector('.clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters(sidebar);
            });
        }
    }

    updateCategoryFilter() {
        const checkedCategories = document.querySelectorAll('input[name="category"]:checked');
        this.filters.categories = Array.from(checkedCategories).map(input => input.value);
    }

    updatePriceFilter(min, max) {
        // Ensure min is not greater than max
        if (parseInt(min) > parseInt(max)) {
            [min, max] = [max, min];
        }
        
        this.filters.priceMin = parseInt(min);
        this.filters.priceMax = parseInt(max);
        
        // Update labels
        const labels = document.querySelector('.price-labels');
        if (labels) {
            labels.innerHTML = `
                <span>$${min}</span>
                <span>$${max}</span>
            `;
        }
    }

    clearAllFilters(sidebar) {
        // Reset filter state
        this.filters = {
            categories: [],
            priceMin: this.options.priceRange.min,
            priceMax: this.options.priceRange.max,
            location: '',
            rating: 0
        };

        // Reset form elements
        sidebar.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        
        sidebar.querySelectorAll('input[type="radio"]').forEach(input => {
            input.checked = false;
        });
        
        const locationInput = sidebar.querySelector('#location-filter');
        if (locationInput) locationInput.value = '';
        
        const priceMin = sidebar.querySelector('#price-min');
        const priceMax = sidebar.querySelector('#price-max');
        if (priceMin) priceMin.value = this.options.priceRange.min;
        if (priceMax) priceMax.value = this.options.priceRange.max;
        
        this.updatePriceFilter(this.options.priceRange.min, this.options.priceRange.max);
        this.options.onFilterChange(this.getFilters());
    }

    getFilters() {
        return { ...this.filters };
    }

    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
    }
}

// ReviewCard Component - Display individual review
class ReviewCard {
    constructor(review, options = {}) {
        this.review = review;
        this.options = {
            showItemInfo: false,
            showActions: false,
            currentUserId: null,
            ...options
        };
    }

    render() {
        const reviewer = window.KinshipStorage.getUser(this.review.reviewerId);
        const item = this.options.showItemInfo ? window.KinshipStorage.getItem(this.review.itemId) : null;
        
        const card = document.createElement('div');
        card.className = 'review-card';
        card.dataset.reviewId = this.review.id;

        const reviewDate = new Date(this.review.createdAt).toLocaleDateString();
        
        card.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <img src="${reviewer?.profile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}" 
                         alt="${reviewer?.profile?.name || 'Anonymous'}" 
                         class="reviewer-avatar">
                    <div class="reviewer-details">
                        <h4 class="reviewer-name">${reviewer?.profile?.name || 'Anonymous'}</h4>
                        <div class="review-date">${reviewDate}</div>
                    </div>
                </div>
                <div class="review-rating">
                    <span class="review-stars">${this.renderStars(this.review.rating)}</span>
                    <span class="rating-number">${this.review.rating}/5</span>
                </div>
            </div>
            
            ${this.options.showItemInfo && item ? `
                <div class="review-item-info">
                    <span>Review for: <strong>${item.title}</strong></span>
                </div>
            ` : ''}
            
            <div class="review-content">
                <p>${this.review.comment}</p>
            </div>
            
            ${this.options.showActions && this.canShowActions() ? `
                <div class="review-actions">
                    <button class="btn-secondary btn-small edit-review" data-review-id="${this.review.id}">
                        Edit
                    </button>
                    <button class="btn-danger btn-small delete-review" data-review-id="${this.review.id}">
                        Delete
                    </button>
                </div>
            ` : ''}
        `;

        this.attachEventListeners(card);
        return card;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '★';
            } else if (i === fullStars && hasHalfStar) {
                stars += '☆';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    canShowActions() {
        return this.options.currentUserId === this.review.reviewerId;
    }

    attachEventListeners(card) {
        const editBtn = card.querySelector('.edit-review');
        const deleteBtn = card.querySelector('.delete-review');

        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEdit());
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }
    }

    handleEdit() {
        // Dispatch event for parent component to handle
        window.dispatchEvent(new CustomEvent('editReview', {
            detail: { reviewId: this.review.id, review: this.review }
        }));
    }

    handleDelete() {
        if (confirm('Are you sure you want to delete this review?')) {
            const success = window.KinshipStorage.deleteReview(this.review.id);
            if (success) {
                // Remove from DOM
                const card = document.querySelector(`[data-review-id="${this.review.id}"]`);
                if (card) {
                    card.remove();
                }
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent('reviewDeleted', {
                    detail: { reviewId: this.review.id }
                }));
                
                if (window.KinshipUtils && window.KinshipUtils.showToast) {
                    window.KinshipUtils.showToast('Review deleted successfully', 'success');
                }
            }
        }
    }
}

// ReviewForm Component - Submit new review
class ReviewForm {
    constructor(options = {}) {
        this.options = {
            itemId: null,
            bookingId: null,
            onSubmit: () => {},
            onCancel: () => {},
            ...options
        };
        this.rating = 0;
    }

    render() {
        const form = document.createElement('div');
        form.className = 'review-form';

        form.innerHTML = `
            <h3>Write a Review</h3>
            
            <div class="form-group">
                <label>Rating</label>
                <div class="star-rating" data-rating="0">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <span class="star" data-star="${star}">☆</span>
                    `).join('')}
                </div>
                <div class="rating-text">Click to rate</div>
            </div>
            
            <div class="form-group">
                <label for="review-comment">Your Review</label>
                <textarea id="review-comment" 
                         class="form-input" 
                         rows="4" 
                         placeholder="Share your experience with this item..."
                         required></textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-secondary cancel-review">Cancel</button>
                <button type="button" class="btn-primary submit-review" disabled>Submit Review</button>
            </div>
        `;

        this.attachEventListeners(form);
        return form;
    }

    attachEventListeners(form) {
        const starRating = form.querySelector('.star-rating');
        const stars = form.querySelectorAll('.star');
        const ratingText = form.querySelector('.rating-text');
        const commentTextarea = form.querySelector('#review-comment');
        const submitBtn = form.querySelector('.submit-review');
        const cancelBtn = form.querySelector('.cancel-review');

        // Star rating interaction
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.rating = index + 1;
                this.updateStarDisplay(stars, this.rating);
                ratingText.textContent = this.getRatingText(this.rating);
                this.validateForm(form);
            });

            star.addEventListener('mouseenter', () => {
                this.updateStarDisplay(stars, index + 1, true);
            });
        });

        starRating.addEventListener('mouseleave', () => {
            this.updateStarDisplay(stars, this.rating);
        });

        // Comment validation
        commentTextarea.addEventListener('input', () => {
            this.validateForm(form);
        });

        // Form submission
        submitBtn.addEventListener('click', () => {
            this.handleSubmit(form);
        });

        cancelBtn.addEventListener('click', () => {
            this.options.onCancel();
        });
    }

    updateStarDisplay(stars, rating, isHover = false) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.classList.add(isHover ? 'hover' : 'selected');
                star.classList.remove(isHover ? 'selected' : 'hover');
            } else {
                star.textContent = '☆';
                star.classList.remove('selected', 'hover');
            }
        });
    }

    getRatingText(rating) {
        const texts = {
            1: 'Poor',
            2: 'Fair', 
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        return texts[rating] || 'Click to rate';
    }

    validateForm(form) {
        const comment = form.querySelector('#review-comment').value.trim();
        const submitBtn = form.querySelector('.submit-review');
        
        const isValid = this.rating > 0 && comment.length >= 10;
        submitBtn.disabled = !isValid;
        
        return isValid;
    }

    handleSubmit(form) {
        if (!this.validateForm(form)) return;

        const currentUser = window.KinshipStorage.getCurrentUser();
        if (!currentUser) {
            alert('Please log in to submit a review');
            return;
        }

        const comment = form.querySelector('#review-comment').value.trim();
        
        const reviewData = {
            id: this.generateReviewId(),
            itemId: this.options.itemId,
            reviewerId: currentUser.id,
            bookingId: this.options.bookingId,
            rating: this.rating,
            comment: comment,
            createdAt: new Date().toISOString()
        };

        // Validate review data
        if (!window.KinshipValidation.validateReviewData(reviewData)) {
            alert('Please fill in all required fields');
            return;
        }

        // Check if user can review
        const canReview = window.KinshipStorage.canUserReview(
            currentUser.id, 
            this.options.itemId, 
            this.options.bookingId
        );

        if (!canReview.canReview) {
            alert(canReview.reason);
            return;
        }

        // Save review
        const success = window.KinshipStorage.saveReview(reviewData);
        
        if (success) {
            this.options.onSubmit(reviewData);
            
            if (window.KinshipUtils && window.KinshipUtils.showToast) {
                window.KinshipUtils.showToast('Review submitted successfully!', 'success');
            }
        } else {
            alert('Failed to submit review. Please try again.');
        }
    }

    generateReviewId() {
        return 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// ReviewSummary Component - Display rating summary
class ReviewSummary {
    constructor(itemId, options = {}) {
        this.itemId = itemId;
        this.options = {
            showWriteReview: true,
            currentUserId: null,
            ...options
        };
    }

    render() {
        const reviews = window.KinshipStorage.getReviews({ itemId: this.itemId });
        const item = window.KinshipStorage.getItem(this.itemId);
        
        const summary = document.createElement('div');
        summary.className = 'review-summary';

        if (reviews.length === 0) {
            summary.innerHTML = `
                <div class="no-reviews">
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to review this item!</p>
                    ${this.renderWriteReviewButton()}
                </div>
            `;
        } else {
            const avgRating = item?.rating || 0;
            const ratingDistribution = this.calculateRatingDistribution(reviews);
            
            summary.innerHTML = `
                <div class="rating-overview">
                    <div class="average-rating">
                        <div class="rating-number">${avgRating.toFixed(1)}</div>
                        <div class="rating-stars">${this.renderStars(avgRating)}</div>
                        <div class="rating-count">${reviews.length} review${reviews.length !== 1 ? 's' : ''}</div>
                    </div>
                    
                    <div class="rating-breakdown">
                        ${[5, 4, 3, 2, 1].map(star => `
                            <div class="rating-bar">
                                <span class="star-label">${star} ★</span>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${ratingDistribution[star]}%"></div>
                                </div>
                                <span class="bar-count">${this.countRatings(reviews, star)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${this.renderWriteReviewButton()}
            `;
        }

        this.attachEventListeners(summary);
        return summary;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '★';
            } else if (i === fullStars && hasHalfStar) {
                stars += '☆';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    calculateRatingDistribution(reviews) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        reviews.forEach(review => {
            distribution[review.rating]++;
        });

        // Convert to percentages
        const total = reviews.length;
        Object.keys(distribution).forEach(rating => {
            distribution[rating] = total > 0 ? (distribution[rating] / total) * 100 : 0;
        });

        return distribution;
    }

    countRatings(reviews, rating) {
        return reviews.filter(review => review.rating === rating).length;
    }

    renderWriteReviewButton() {
        if (!this.options.showWriteReview || !this.options.currentUserId) {
            return '';
        }

        const canReview = window.KinshipStorage.canUserReview(this.options.currentUserId, this.itemId);
        
        if (!canReview.canReview) {
            return '';
        }

        return `
            <div class="write-review-section">
                <button class="btn-primary write-review-btn" data-item-id="${this.itemId}">
                    Write a Review
                </button>
            </div>
        `;
    }

    attachEventListeners(summary) {
        const writeReviewBtn = summary.querySelector('.write-review-btn');
        
        if (writeReviewBtn) {
            writeReviewBtn.addEventListener('click', () => {
                this.handleWriteReview();
            });
        }
    }

    handleWriteReview() {
        // Dispatch event for parent component to handle
        window.dispatchEvent(new CustomEvent('writeReview', {
            detail: { itemId: this.itemId }
        }));
    }
}

// Export components for use in other modules
window.Components = {
    ItemCard,
    Modal,
    ImageGallery,
    FilterSidebar,
    ReviewCard,
    ReviewForm,
    ReviewSummary
};

console.log('Components module loaded with ItemCard, Modal, ImageGallery, FilterSidebar, ReviewCard, ReviewForm, and ReviewSummary');