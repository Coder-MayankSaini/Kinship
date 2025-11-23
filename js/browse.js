/**
 * Browse Page JavaScript for Kinship Rental Platform
 * Handles search interface, filtering, and item display
 */

class BrowsePage {
    constructor() {
        this.searchManager = window.KinshipSearch;
        this.searchDisplay = window.KinshipSearchDisplay;
        this.currentFilters = {};
        this.currentSort = 'newest';
        this.currentPage = 1;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        // Search and sort controls
        this.searchInput = document.getElementById('search-input');
        this.sortSelect = document.getElementById('sort-select');
        
        // Filter elements
        this.categoryCheckboxes = document.querySelectorAll('input[name="category"]');
        this.priceMinSlider = document.getElementById('price-min');
        this.priceMaxSlider = document.getElementById('price-max');
        this.locationInput = document.querySelector('input[placeholder="Enter location"]');
        this.ratingRadios = document.querySelectorAll('input[name="rating"]');
        this.clearFiltersBtn = document.querySelector('.clear-filters');
        
        // Results elements
        this.itemsGrid = document.getElementById('items-grid');
        this.resultsCount = document.getElementById('results-count');
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.pageInfo = document.getElementById('page-info');
    }

    attachEventListeners() {
        // Search input with debounce
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        // Sort dropdown
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }

        // Category filters
        this.categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleCategoryFilter();
            });
        });

        // Price range sliders
        if (this.priceMinSlider && this.priceMaxSlider) {
            this.priceMinSlider.addEventListener('input', () => {
                this.handlePriceFilter();
            });
            this.priceMaxSlider.addEventListener('input', () => {
                this.handlePriceFilter();
            });
        }

        // Location filter
        if (this.locationInput) {
            let locationTimeout;
            this.locationInput.addEventListener('input', (e) => {
                clearTimeout(locationTimeout);
                locationTimeout = setTimeout(() => {
                    this.handleLocationFilter(e.target.value);
                }, 300);
            });
        }

        // Rating filters
        this.ratingRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.handleRatingFilter();
            });
        });

        // Clear filters button
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Pagination buttons
        if (this.prevPageBtn) {
            this.prevPageBtn.addEventListener('click', () => {
                this.goToPage(this.currentPage - 1);
            });
        }
        if (this.nextPageBtn) {
            this.nextPageBtn.addEventListener('click', () => {
                this.goToPage(this.currentPage + 1);
            });
        }

        // Listen for search results updates
        window.addEventListener('searchResultsUpdated', (e) => {
            this.updateDisplay(e.detail);
        });

        // Handle URL parameters for search
        this.handleUrlParameters();
    }

    handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const category = urlParams.get('category');
        
        if (searchQuery) {
            this.searchInput.value = searchQuery;
            this.currentFilters.search = searchQuery;
        }
        
        if (category) {
            const categoryCheckbox = document.querySelector(`input[value="${category}"]`);
            if (categoryCheckbox) {
                categoryCheckbox.checked = true;
                this.handleCategoryFilter();
            }
        }
    }

    loadInitialData() {
        // Load initial search results
        this.performSearch();
        
        // Update price range sliders with actual data
        this.updatePriceRangeSliders();
    }

    updatePriceRangeSliders() {
        const priceRange = this.searchManager.getPriceRange();
        
        if (this.priceMinSlider && this.priceMaxSlider) {
            this.priceMinSlider.min = priceRange.min;
            this.priceMinSlider.max = priceRange.max;
            this.priceMinSlider.value = priceRange.min;
            
            this.priceMaxSlider.min = priceRange.min;
            this.priceMaxSlider.max = priceRange.max;
            this.priceMaxSlider.value = priceRange.max;
            
            // Update price labels
            const priceLabels = document.querySelector('.price-labels');
            if (priceLabels) {
                priceLabels.innerHTML = `
                    <span>₹${priceRange.min}</span>
                    <span>₹${priceRange.max}+</span>
                `;
            }
        }
    }

    handleSearch(query) {
        this.currentFilters.search = query;
        this.currentPage = 1;
        this.performSearch();
    }

    handleSortChange(sortValue) {
        this.currentSort = sortValue;
        this.performSearch();
    }

    handleCategoryFilter() {
        const selectedCategories = Array.from(this.categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        if (selectedCategories.length > 0) {
            // For now, use the first selected category (search.js expects single category)
            this.currentFilters.category = selectedCategories[0];
        } else {
            delete this.currentFilters.category;
        }
        
        this.currentPage = 1;
        this.performSearch();
    }

    handlePriceFilter() {
        const minPrice = parseInt(this.priceMinSlider.value);
        const maxPrice = parseInt(this.priceMaxSlider.value);
        
        // Ensure min is not greater than max
        if (minPrice > maxPrice) {
            this.priceMinSlider.value = maxPrice;
            this.priceMaxSlider.value = minPrice;
        }
        
        this.currentFilters.minPrice = parseInt(this.priceMinSlider.value);
        this.currentFilters.maxPrice = parseInt(this.priceMaxSlider.value);
        
        // Update price labels
        const priceLabels = document.querySelector('.price-labels');
        if (priceLabels) {
            priceLabels.innerHTML = `
                <span>₹${this.currentFilters.minPrice}</span>
                <span>₹${this.currentFilters.maxPrice}</span>
            `;
        }
        
        this.currentPage = 1;
        this.performSearch();
    }

    handleLocationFilter(location) {
        if (location.trim()) {
            this.currentFilters.location = location.trim();
        } else {
            delete this.currentFilters.location;
        }
        
        this.currentPage = 1;
        this.performSearch();
    }

    handleRatingFilter() {
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        
        if (selectedRating) {
            this.currentFilters.minRating = parseInt(selectedRating.value);
        } else {
            delete this.currentFilters.minRating;
        }
        
        this.currentPage = 1;
        this.performSearch();
    }

    clearAllFilters() {
        // Clear form elements
        this.searchInput.value = '';
        this.sortSelect.value = 'newest';
        
        this.categoryCheckboxes.forEach(cb => cb.checked = false);
        this.ratingRadios.forEach(radio => radio.checked = false);
        
        if (this.locationInput) {
            this.locationInput.value = '';
        }
        
        // Reset price sliders
        this.updatePriceRangeSliders();
        
        // Clear filters and search
        this.currentFilters = {};
        this.currentSort = 'newest';
        this.currentPage = 1;
        
        this.performSearch();
        
        // Update URL
        window.history.replaceState({}, '', window.location.pathname);
    }

    performSearch() {
        // Show loading state
        this.showLoadingState();
        
        // Perform search with current filters
        const searchQuery = this.currentFilters.search || '';
        const results = this.searchManager.searchItems(
            searchQuery,
            this.currentFilters,
            this.currentSort,
            this.currentPage
        );
        
        // Update display
        this.updateDisplay(results);
        
        // Update URL with current search state
        this.updateUrl();
    }

    showLoadingState() {
        if (this.itemsGrid) {
            this.itemsGrid.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading items...</p>
                </div>
            `;
        }
        
        if (this.resultsCount) {
            this.resultsCount.textContent = 'Loading...';
        }
    }

    updateDisplay(results) {
        // Update results count
        if (this.resultsCount) {
            const { pagination, totalResults } = results;
            const { startIndex, endIndex } = pagination;
            
            if (totalResults === 0) {
                this.resultsCount.textContent = 'No items found';
            } else {
                this.resultsCount.textContent = `Showing ${startIndex}-${endIndex} of ${totalResults} items`;
            }
        }
        
        // Update items grid
        this.updateItemsGrid(results.items);
        
        // Update pagination
        this.updatePagination(results.pagination);
    }

    updateItemsGrid(items) {
        if (!this.itemsGrid) return;
        
        if (items.length === 0) {
            this.itemsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-content">
                        <div class="no-results-icon icon-search-empty"></div>
                        <h3>No items found</h3>
                        <p>Try adjusting your search criteria or filters</p>
                        <button class="btn-primary" onclick="browsePage.clearAllFilters()">
                            Clear All Filters
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Clear grid
        this.itemsGrid.innerHTML = '';
        
        // Create item cards
        items.forEach(item => {
            const itemCard = this.createItemCard(item);
            this.itemsGrid.appendChild(itemCard);
        });
    }

    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.itemId = item.id;

        const imageUrl = item.images && item.images.length > 0 
            ? item.images[0] 
            : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';

        card.innerHTML = `
            <div class="item-card-image">
                <img src="${imageUrl}" alt="${item.title}" loading="lazy">
                <button class="favorite-btn" data-item-id="${item.id}">
                    ♡
                </button>
            </div>
            <div class="item-card-content">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-location">${item.location}</p>
                <div class="item-rating">
                    <span class="rating-stars">${this.renderStars(item.rating || 0)}</span>
                    <span class="rating-value">${(item.rating || 0).toFixed(1)}</span>
                </div>
                <div class="item-price">
                    <span class="price-amount">₹${item.pricing.daily}</span>
                    <span class="price-period">per day</span>
                </div>
            </div>
        `;

        // Add click handler to navigate to item detail
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn')) {
                window.location.href = `item-detail.html?id=${item.id}`;
            }
        });

        // Add favorite button handler
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(item.id, favoriteBtn);
            });
            
            // Update favorite state
            this.updateFavoriteState(item.id, favoriteBtn);
        }

        return card;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<span class="star filled">★</span>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHtml += '<span class="star half">★</span>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<span class="star empty">☆</span>';
        }

        return starsHtml;
    }

    toggleFavorite(itemId, button) {
        // Check if user is logged in
        const currentUser = window.KinshipStorage?.getCurrentUser();
        if (!currentUser) {
            // Show login modal or redirect to auth page
            window.location.href = 'auth.html';
            return;
        }

        // Toggle favorite status
        const isFavorite = window.KinshipStorage.isFavorite(currentUser.id, itemId);
        
        if (isFavorite) {
            window.KinshipStorage.removeFromFavorites(currentUser.id, itemId);
            button.textContent = '♡';
            button.classList.remove('favorited');
        } else {
            window.KinshipStorage.addToFavorites(currentUser.id, itemId);
            button.textContent = '♥';
            button.classList.add('favorited');
        }
    }

    updateFavoriteState(itemId, button) {
        const currentUser = window.KinshipStorage?.getCurrentUser();
        if (!currentUser) return;

        const isFavorite = window.KinshipStorage.isFavorite(currentUser.id, itemId);
        
        if (isFavorite) {
            button.textContent = '♥';
            button.classList.add('favorited');
        } else {
            button.textContent = '♡';
            button.classList.remove('favorited');
        }
    }

    updatePagination(pagination) {
        // Update pagination buttons
        if (this.prevPageBtn) {
            this.prevPageBtn.disabled = !pagination.hasPrevPage;
        }
        
        if (this.nextPageBtn) {
            this.nextPageBtn.disabled = !pagination.hasNextPage;
        }
        
        // Update page info
        if (this.pageInfo) {
            this.pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.performSearch();
        
        // Scroll to top of results
        const itemsSection = document.querySelector('.items-section');
        if (itemsSection) {
            itemsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateUrl() {
        const params = new URLSearchParams();
        
        if (this.currentFilters.search) {
            params.set('search', this.currentFilters.search);
        }
        
        if (this.currentFilters.category) {
            params.set('category', this.currentFilters.category);
        }
        
        if (this.currentSort !== 'newest') {
            params.set('sort', this.currentSort);
        }
        
        if (this.currentPage > 1) {
            params.set('page', this.currentPage);
        }
        
        const newUrl = params.toString() ? 
            `${window.location.pathname}?${params.toString()}` : 
            window.location.pathname;
            
        window.history.replaceState({}, '', newUrl);
    }
}

// Initialize browse page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the browse page
    if (document.querySelector('.browse-page')) {
        window.browsePage = new BrowsePage();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowsePage;
}