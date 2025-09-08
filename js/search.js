/**
 * Search and Filtering Module for Kinship Rental Platform
 * Handles item discovery and filtering functionality
 */

class SearchManager {
    constructor() {
        this.storage = window.KinshipStorage;
        this.currentFilters = {};
        this.currentSort = 'relevance';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.searchResults = [];
        this.totalResults = 0;
    }

    /**
     * Main search function that combines text search with filters
     * @param {string} query - Search query text
     * @param {Object} filters - Filter options
     * @param {string} sortBy - Sort option
     * @param {number} page - Page number for pagination
     * @returns {Object} Search results with pagination info
     */
    searchItems(query = '', filters = {}, sortBy = 'relevance', page = 1) {
        // Store current search parameters
        this.currentFilters = { ...filters, search: query };
        this.currentSort = sortBy;
        this.currentPage = page;

        // Get all items from storage
        let items = this.storage.getItems();

        // Apply text search
        if (query && query.trim()) {
            items = this.performTextSearch(items, query.trim());
        }

        // Apply filters
        items = this.applyFilters(items, filters);

        // Store total results before pagination
        this.totalResults = items.length;

        // Apply sorting
        items = this.sortItems(items, sortBy);

        // Apply pagination
        const paginatedResults = this.paginateResults(items, page);

        // Store results for reference
        this.searchResults = items;

        return {
            items: paginatedResults.items,
            pagination: paginatedResults.pagination,
            totalResults: this.totalResults,
            filters: this.currentFilters,
            sortBy: this.currentSort
        };
    }

    /**
     * Perform text search on items
     * @param {Array} items - Items to search
     * @param {string} query - Search query
     * @returns {Array} Filtered items
     */
    performTextSearch(items, query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return items.filter(item => {
            const searchableText = [
                item.title,
                item.description,
                item.category,
                item.location
            ].join(' ').toLowerCase();

            // Check if all search terms are found
            return searchTerms.every(term => searchableText.includes(term));
        });
    }

    /**
     * Apply various filters to items
     * @param {Array} items - Items to filter
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered items
     */
    applyFilters(items, filters) {
        let filteredItems = [...items];

        // Category filter
        if (filters.category && filters.category !== 'all') {
            filteredItems = this.filterByCategory(filteredItems, filters.category);
        }

        // Price range filter
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            filteredItems = this.filterByPrice(
                filteredItems, 
                filters.minPrice, 
                filters.maxPrice
            );
        }

        // Location filter
        if (filters.location && filters.location.trim()) {
            filteredItems = this.filterByLocation(filteredItems, filters.location);
        }

        // Rating filter
        if (filters.minRating !== undefined) {
            filteredItems = this.filterByRating(filteredItems, filters.minRating);
        }

        // Availability filter
        if (filters.startDate && filters.endDate) {
            filteredItems = this.filterByAvailability(
                filteredItems, 
                filters.startDate, 
                filters.endDate
            );
        }

        return filteredItems;
    }

    /**
     * Filter items by category
     * @param {Array} items - Items to filter
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered items
     */
    filterByCategory(items, category) {
        return items.filter(item => 
            item.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Filter items by price range
     * @param {Array} items - Items to filter
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     * @returns {Array} Filtered items
     */
    filterByPrice(items, minPrice, maxPrice) {
        return items.filter(item => {
            const price = item.pricing.daily;
            const meetsMin = minPrice === undefined || price >= minPrice;
            const meetsMax = maxPrice === undefined || price <= maxPrice;
            return meetsMin && meetsMax;
        });
    }

    /**
     * Filter items by location
     * @param {Array} items - Items to filter
     * @param {string} location - Location to filter by
     * @returns {Array} Filtered items
     */
    filterByLocation(items, location) {
        const locationTerm = location.toLowerCase().trim();
        return items.filter(item =>
            item.location.toLowerCase().includes(locationTerm)
        );
    }

    /**
     * Filter items by minimum rating
     * @param {Array} items - Items to filter
     * @param {number} minRating - Minimum rating
     * @returns {Array} Filtered items
     */
    filterByRating(items, minRating) {
        return items.filter(item => item.rating >= minRating);
    }

    /**
     * Filter items by availability dates
     * @param {Array} items - Items to filter
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Array} Filtered items
     */
    filterByAvailability(items, startDate, endDate) {
        return items.filter(item => {
            if (!item.availability || !Array.isArray(item.availability)) {
                return false;
            }

            // Check if all requested dates are available
            const requestedDates = this.getDateRange(startDate, endDate);
            return requestedDates.every(date => 
                item.availability.includes(date)
            );
        });
    }

    /**
     * Sort items by various criteria
     * @param {Array} items - Items to sort
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted items
     */
    sortItems(items, sortBy) {
        const sortedItems = [...items];

        switch (sortBy) {
            case 'price-low':
                return sortedItems.sort((a, b) => a.pricing.daily - b.pricing.daily);
            
            case 'price-high':
                return sortedItems.sort((a, b) => b.pricing.daily - a.pricing.daily);
            
            case 'rating':
                return sortedItems.sort((a, b) => b.rating - a.rating);
            
            case 'newest':
                return sortedItems.sort((a, b) => 
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );
            
            case 'alphabetical':
                return sortedItems.sort((a, b) => 
                    a.title.localeCompare(b.title)
                );
            
            case 'relevance':
            default:
                // For relevance, we could implement a scoring system
                // For now, return items as-is (already filtered by relevance)
                return sortedItems;
        }
    }

    /**
     * Paginate search results
     * @param {Array} items - Items to paginate
     * @param {number} page - Current page number
     * @returns {Object} Paginated results with pagination info
     */
    paginateResults(items, page) {
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;

        const paginatedItems = items.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage: this.itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1,
                startIndex: startIndex + 1,
                endIndex: Math.min(endIndex, totalItems)
            }
        };
    }

    /**
     * Get available categories from all items
     * @returns {Array} Array of unique categories
     */
    getAvailableCategories() {
        const items = this.storage.getItems();
        const categories = [...new Set(items.map(item => item.category))];
        return categories.sort();
    }

    /**
     * Get price range from all items
     * @returns {Object} Min and max prices
     */
    getPriceRange() {
        const items = this.storage.getItems();
        if (items.length === 0) {
            return { min: 0, max: 100 };
        }

        const prices = items.map(item => item.pricing.daily);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    /**
     * Get available locations from all items
     * @returns {Array} Array of unique locations
     */
    getAvailableLocations() {
        const items = this.storage.getItems();
        const locations = [...new Set(items.map(item => item.location))];
        return locations.sort();
    }

    /**
     * Get search suggestions based on query
     * @param {string} query - Search query
     * @returns {Array} Array of suggestions
     */
    getSearchSuggestions(query) {
        if (!query || query.length < 2) {
            return [];
        }

        const items = this.storage.getItems();
        const suggestions = new Set();
        const queryLower = query.toLowerCase();

        items.forEach(item => {
            // Add title suggestions
            if (item.title.toLowerCase().includes(queryLower)) {
                suggestions.add(item.title);
            }

            // Add category suggestions
            if (item.category.toLowerCase().includes(queryLower)) {
                suggestions.add(item.category);
            }

            // Add location suggestions
            if (item.location.toLowerCase().includes(queryLower)) {
                suggestions.add(item.location);
            }
        });

        return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
    }

    /**
     * Generate date range between two dates
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Array} Array of date strings
     */
    getDateRange(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(date.toISOString().split('T')[0]);
        }

        return dates;
    }

    /**
     * Clear all filters and reset search
     */
    clearFilters() {
        this.currentFilters = {};
        this.currentSort = 'relevance';
        this.currentPage = 1;
        this.searchResults = [];
        this.totalResults = 0;
    }

    /**
     * Get current search state
     * @returns {Object} Current search state
     */
    getCurrentSearchState() {
        return {
            filters: this.currentFilters,
            sort: this.currentSort,
            page: this.currentPage,
            totalResults: this.totalResults,
            itemsPerPage: this.itemsPerPage
        };
    }

    /**
     * Update items per page setting
     * @param {number} itemsPerPage - Number of items per page
     */
    setItemsPerPage(itemsPerPage) {
        this.itemsPerPage = Math.max(1, Math.min(itemsPerPage, 50)); // Limit between 1-50
    }
}

// Search result display utilities
class SearchResultsDisplay {
    constructor(searchManager) {
        this.searchManager = searchManager;
    }

    /**
     * Render search results to a container
     * @param {HTMLElement} container - Container element
     * @param {Object} searchResults - Search results object
     */
    renderResults(container, searchResults) {
        if (!container) return;

        // Clear container
        container.innerHTML = '';

        // Show results summary
        this.renderResultsSummary(container, searchResults);

        // Show items
        if (searchResults.items.length > 0) {
            this.renderItemGrid(container, searchResults.items);
            this.renderPagination(container, searchResults.pagination);
        } else {
            this.renderNoResults(container);
        }
    }

    /**
     * Render results summary
     * @param {HTMLElement} container - Container element
     * @param {Object} searchResults - Search results object
     */
    renderResultsSummary(container, searchResults) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'search-results-summary';
        
        const { pagination, totalResults } = searchResults;
        const { startIndex, endIndex } = pagination;

        summaryDiv.innerHTML = `
            <p>Showing ${startIndex}-${endIndex} of ${totalResults} results</p>
        `;

        container.appendChild(summaryDiv);
    }

    /**
     * Render item grid
     * @param {HTMLElement} container - Container element
     * @param {Array} items - Items to render
     */
    renderItemGrid(container, items) {
        const gridDiv = document.createElement('div');
        gridDiv.className = 'search-results-grid';

        items.forEach(item => {
            const itemCard = this.createItemCard(item);
            gridDiv.appendChild(itemCard);
        });

        container.appendChild(gridDiv);
    }

    /**
     * Create item card element
     * @param {Object} item - Item data
     * @returns {HTMLElement} Item card element
     */
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
        }

        return card;
    }

    /**
     * Toggle favorite status for an item
     * @param {string} itemId - Item ID
     * @param {HTMLElement} button - Favorite button element
     */
    toggleFavorite(itemId, button) {
        // Check if user is logged in
        const currentUser = window.KinshipStorage?.getCurrentUser();
        if (!currentUser) {
            alert('Please log in to add favorites');
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

    /**
     * Render star rating
     * @param {number} rating - Rating value
     * @returns {string} HTML for stars
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="icon-star-filled"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHtml += '<i class="icon-star-half"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="icon-star-empty"></i>';
        }

        return starsHtml;
    }

    /**
     * Render pagination controls
     * @param {HTMLElement} container - Container element
     * @param {Object} pagination - Pagination data
     */
    renderPagination(container, pagination) {
        if (pagination.totalPages <= 1) return;

        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';

        // Previous button
        if (pagination.hasPrevPage) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'pagination-btn';
            prevBtn.textContent = 'Previous';
            prevBtn.addEventListener('click', () => this.goToPage(pagination.currentPage - 1));
            paginationDiv.appendChild(prevBtn);
        }

        // Page numbers
        const startPage = Math.max(1, pagination.currentPage - 2);
        const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === pagination.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => this.goToPage(i));
            paginationDiv.appendChild(pageBtn);
        }

        // Next button
        if (pagination.hasNextPage) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'pagination-btn';
            nextBtn.textContent = 'Next';
            nextBtn.addEventListener('click', () => this.goToPage(pagination.currentPage + 1));
            paginationDiv.appendChild(nextBtn);
        }

        container.appendChild(paginationDiv);
    }

    /**
     * Render no results message
     * @param {HTMLElement} container - Container element
     */
    renderNoResults(container) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <div class="no-results-content">
                <i class="icon-search-empty"></i>
                <h3>No items found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button class="btn btn-primary" onclick="window.KinshipSearch.clearFilters()">
                    Clear Filters
                </button>
            </div>
        `;

        container.appendChild(noResultsDiv);
    }

    /**
     * Navigate to specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        const currentState = this.searchManager.getCurrentSearchState();
        const searchResults = this.searchManager.searchItems(
            currentState.filters.search || '',
            currentState.filters,
            currentState.sort,
            page
        );

        // Trigger custom event for page change
        window.dispatchEvent(new CustomEvent('searchResultsUpdated', {
            detail: searchResults
        }));
    }
}

// Create global search manager instance
window.KinshipSearch = new SearchManager();
window.KinshipSearchDisplay = new SearchResultsDisplay(window.KinshipSearch);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SearchManager, SearchResultsDisplay };
}