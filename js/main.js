// Kinship - Main JavaScript File
// Application entry point and initialization

// Application state
window.KinshipApp = {
    currentUser: null,
    isInitialized: false,
    modules: {
        storage: false,
        auth: false,
        components: false,
        search: false,
        booking: false,
        router: false
    }
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('Initializing Kinship App...');
    
    // Initialize core modules in order
    initializeModules()
        .then(() => {
            // Initialize navigation
            initializeNavigation();
            
            // Check authentication state
            checkAuthenticationState();
            
            // Initialize favorites system
            initializeFavoritesSystem();
            
            // Initialize page-specific functionality
            initializePageFunctionality();
            
            // DISABLED: Initialize sample data if needed
            // initializeSampleDataIfNeeded(); // DISABLED - No automatic loading
            
            // Mark app as initialized
            window.KinshipApp.isInitialized = true;
            
            console.log('Kinship App initialized successfully');
            
            // Dispatch initialization complete event
            window.dispatchEvent(new CustomEvent('kinshipAppInitialized'));
            
            // If on homepage, reload featured items
            if (getCurrentPage() === 'index') {
                loadFeaturedItems();
            }
        })
        .catch(error => {
            console.error('Failed to initialize Kinship App:', error);
        });
}

// Initialize all modules and verify they're loaded
async function initializeModules() {
    console.log('Initializing modules...');
    
    // Wait for modules to be available
    await waitForModules();
    
    // Initialize storage
    if (typeof StorageManager !== 'undefined') {
        window.KinshipStorage = new StorageManager();
        window.KinshipApp.modules.storage = true;
        console.log('✓ Storage module initialized');
    }
    
    // Initialize authentication
    if (typeof AuthManager !== 'undefined') {
        window.KinshipAuth = new AuthManager();
        window.KinshipApp.modules.auth = true;
        console.log('✓ Auth module initialized');
    }
    
    // Initialize components
    if (typeof window.Components !== 'undefined') {
        window.KinshipApp.modules.components = true;
        console.log('✓ Components module initialized');
    }
    
    // Initialize search
    if (typeof SearchManager !== 'undefined') {
        window.KinshipSearch = new SearchManager();
        window.KinshipApp.modules.search = true;
        console.log('✓ Search module initialized');
    }
    
    // Initialize booking
    if (typeof BookingManager !== 'undefined') {
        window.KinshipBooking = new BookingManager();
        window.KinshipApp.modules.booking = true;
        console.log('✓ Booking module initialized');
    }
    
    // Router is initialized separately in router.js
    if (typeof window.KinshipRouter !== 'undefined') {
        window.KinshipApp.modules.router = true;
        console.log('✓ Router module initialized');
    }
    
    console.log('Module initialization complete');
}

// Wait for all required modules to be loaded
function waitForModules() {
    return new Promise((resolve) => {
        const checkModules = () => {
            const requiredModules = [
                'StorageManager',
                'AuthManager', 
                'SearchManager',
                'BookingManager'
            ];
            
            const allLoaded = requiredModules.every(moduleName => 
                typeof window[moduleName] !== 'undefined'
            );
            
            if (allLoaded || document.readyState === 'complete') {
                resolve();
            } else {
                setTimeout(checkModules, 50);
            }
        };
        
        checkModules();
    });
}

// Initialize navigation functionality
function initializeNavigation() {
    // Navigation is now handled by the NavigationManager in router.js
    // This function is kept for backward compatibility
    
    // Add accessibility attributes to hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        // Set initial ARIA attributes
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-menu');
        
        navMenu.setAttribute('id', 'nav-menu');
        navMenu.setAttribute('aria-hidden', 'true');
        
        // Create and add navigation overlay for mobile
        let navOverlay = document.querySelector('.nav-overlay');
        if (!navOverlay) {
            navOverlay = document.createElement('div');
            navOverlay.className = 'nav-overlay';
            document.body.appendChild(navOverlay);
        }
        
        // Enhanced mobile navigation functionality
        const toggleNavigation = () => {
            const isOpen = navMenu.classList.contains('active');
            
            if (isOpen) {
                // Close navigation
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                navOverlay.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            } else {
                // Open navigation
                navMenu.classList.add('active');
                hamburger.classList.add('active');
                navOverlay.classList.add('active');
                hamburger.setAttribute('aria-expanded', 'true');
                navMenu.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        };
        
        // Hamburger click handler
        hamburger.addEventListener('click', toggleNavigation);
        
        // Overlay click handler (close menu when clicking outside)
        navOverlay.addEventListener('click', toggleNavigation);
        
        // Close menu when clicking on navigation links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleNavigation();
                }
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                toggleNavigation();
            }
        });
        
        // Handle window resize - close mobile menu on desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && navMenu.classList.contains('active')) {
                toggleNavigation();
            }
        });
        
        // Improve touch scrolling on mobile
        if ('ontouchstart' in window) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }
        
        // Add swipe gesture support for mobile navigation
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        });
        
        function handleSwipeGesture() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            
            // Swipe right to open menu (from left edge)
            if (swipeDistance > swipeThreshold && touchStartX < 50 && !navMenu.classList.contains('active')) {
                toggleNavigation();
            }
            
            // Swipe left to close menu
            if (swipeDistance < -swipeThreshold && navMenu.classList.contains('active')) {
                toggleNavigation();
            }
        }
        
        // The actual functionality is handled by NavigationManager
        // but we can add additional enhancements here if needed
    }
}

// Check if user is authenticated
function checkAuthenticationState() {
    const currentUser = window.KinshipStorage ? window.KinshipStorage.getCurrentUser() : null;
    if (currentUser) {
        window.KinshipApp.currentUser = currentUser;
        updateNavigationForAuthenticatedUser();
    }
}

// Update navigation for authenticated users
function updateNavigationForAuthenticatedUser() {
    const loginLink = document.querySelector('a[href="auth.html"]');
    if (loginLink && window.KinshipApp.currentUser) {
        loginLink.textContent = 'Profile';
        loginLink.href = 'profile.html';
    }
}

// Initialize favorites system
function initializeFavoritesSystem() {
    console.log('Initializing favorites system...');
    
    // Listen for favorite toggle events globally
    window.addEventListener('favoriteToggled', function(event) {
        const { itemId, isFavorited } = event.detail;
        console.log(`Item ${itemId} ${isFavorited ? 'added to' : 'removed from'} favorites`);
        
        // Update all favorite buttons for this item across the page
        updateFavoriteButtonsForItem(itemId, isFavorited);
    });
    
    // Initialize favorite buttons on page load
    setTimeout(() => {
        initializeFavoriteButtons();
    }, 100);
}

// Update all favorite buttons for a specific item
function updateFavoriteButtonsForItem(itemId, isFavorited) {
    const favoriteButtons = document.querySelectorAll(`[data-item-id="${itemId}"] .item-card-favorite, [data-item-id="${itemId}"] .favorite-btn`);
    
    favoriteButtons.forEach(button => {
        const heartIcon = button.querySelector('.heart-icon') || button;
        
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
    });
}

// Initialize favorite buttons on page load
function initializeFavoriteButtons() {
    const currentUser = window.KinshipStorage?.getCurrentUser();
    if (!currentUser) return;
    
    // Find all favorite buttons and update their state
    const favoriteButtons = document.querySelectorAll('.item-card-favorite, .favorite-btn');
    
    favoriteButtons.forEach(button => {
        const itemId = button.dataset.itemId || button.closest('[data-item-id]')?.dataset.itemId;
        if (itemId) {
            const isFavorited = window.KinshipStorage.isFavorite(currentUser.id, itemId);
            updateFavoriteButtonsForItem(itemId, isFavorited);
        }
    });
}

// Initialize page-specific functionality based on current page
function initializePageFunctionality() {
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            initializeHomepage();
            break;
        case 'browse':
            initializeBrowsePage();
            break;
        case 'item-detail':
            initializeItemDetailPage();
            break;
        case 'profile':
            initializeProfilePage();
            break;
        case 'list-item':
            initializeListItemPage();
            break;
        case 'auth':
            initializeAuthPage();
            break;
        default:
            console.log('No specific initialization for this page');
    }
}

// Get current page name from URL
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
}

// Homepage initialization
function initializeHomepage() {
    console.log('Initializing homepage...');
    
    // Initialize search functionality
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        const searchInput = searchBar.querySelector('input');
        const searchButton = searchBar.querySelector('button');
        
        if (searchButton) {
            searchButton.addEventListener('click', function(e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `browse.html?search=${encodeURIComponent(query)}`;
                }
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = this.value.trim();
                    if (query) {
                        window.location.href = `browse.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }
    
    // Initialize category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        const navigateToCategory = () => {
            const category = card.dataset.category || card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `browse.html?category=${category}`;
        };
        
        card.addEventListener('click', navigateToCategory);
        
        // Add keyboard navigation support
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToCategory();
            }
        });
    });
    
    // Load featured items after a short delay to ensure storage is ready
    setTimeout(() => {
        loadFeaturedItems();
    }, 100);
    

}

// Browse page initialization
function initializeBrowsePage() {
    console.log('Initializing browse page...');
    
    if (!window.KinshipSearch) {
        console.error('Search manager not available');
        return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('search') || '';
    const initialCategory = urlParams.get('category') || '';

    // Set initial search input value
    const searchInput = document.getElementById('search-input');
    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    // Initialize filters from URL or defaults
    const initialFilters = {};
    if (initialCategory) {
        initialFilters.category = initialCategory;
    }

    // Perform initial search
    performSearch(initialQuery, initialFilters);

    // Set up search input handler
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = this.value.trim();
                const filters = getCurrentFilters();
                performSearch(query, filters);
                updateURL(query, filters);
            }, 300); // Debounce search
        });
    }

    // Set up sort handler
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const query = searchInput ? searchInput.value.trim() : '';
            const filters = getCurrentFilters();
            const sortBy = this.value;
            performSearch(query, filters, sortBy);
        });
    }

    // Set up filter handlers
    setupFilterHandlers();

    // Set up pagination handlers
    setupPaginationHandlers();

    // Listen for search results updates
    window.addEventListener('searchResultsUpdated', function(event) {
        displaySearchResults(event.detail);
    });
}

// Perform search and display results
function performSearch(query = '', filters = {}, sortBy = 'newest', page = 1) {
    const searchResults = window.KinshipSearch.searchItems(query, filters, sortBy, page);
    displaySearchResults(searchResults);
}

// Display search results
function displaySearchResults(searchResults) {
    const itemsGrid = document.getElementById('items-grid');
    const resultsCount = document.getElementById('results-count');
    
    if (!itemsGrid) return;

    // Update results count
    if (resultsCount) {
        const { pagination, totalResults } = searchResults;
        resultsCount.textContent = `Showing ${pagination.startIndex}-${pagination.endIndex} of ${totalResults} items`;
    }

    // Use the search display utility to render results
    window.KinshipSearchDisplay.renderResults(itemsGrid, searchResults);

    // Update pagination
    updatePagination(searchResults.pagination);
}

// Get current filters from form
function getCurrentFilters() {
    const filters = {};

    // Category filters
    const categoryCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]:checked');
    if (categoryCheckboxes.length > 0) {
        filters.category = Array.from(categoryCheckboxes).map(cb => cb.value)[0]; // Take first for now
    }

    // Price range filters
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin && priceMin.value > 0) {
        filters.minPrice = parseInt(priceMin.value);
    }
    if (priceMax && priceMax.value < 500) {
        filters.maxPrice = parseInt(priceMax.value);
    }

    // Location filter
    const locationInput = document.querySelector('.filter-group input[type="text"]');
    if (locationInput && locationInput.value.trim()) {
        filters.location = locationInput.value.trim();
    }

    // Rating filter
    const ratingRadio = document.querySelector('input[name="rating"]:checked');
    if (ratingRadio) {
        filters.minRating = parseInt(ratingRadio.value);
    }

    return filters;
}

// Set up filter event handlers
function setupFilterHandlers() {
    // Category checkboxes
    const categoryCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const query = document.getElementById('search-input')?.value.trim() || '';
            const filters = getCurrentFilters();
            const sortBy = document.getElementById('sort-select')?.value || 'newest';
            performSearch(query, filters, sortBy);
        });
    });

    // Price range sliders
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    
    if (priceMin && priceMax) {
        let priceTimeout;
        
        const handlePriceChange = () => {
            clearTimeout(priceTimeout);
            priceTimeout = setTimeout(() => {
                const query = document.getElementById('search-input')?.value.trim() || '';
                const filters = getCurrentFilters();
                const sortBy = document.getElementById('sort-select')?.value || 'newest';
                performSearch(query, filters, sortBy);
                
                // Update price labels
                const labels = document.querySelector('.price-labels');
                if (labels) {
                    labels.innerHTML = `<span>₹${priceMin.value}</span><span>₹${priceMax.value}+</span>`;
                }
            }, 300);
        };

        priceMin.addEventListener('input', handlePriceChange);
        priceMax.addEventListener('input', handlePriceChange);
    }

    // Location input
    const locationInput = document.querySelector('.filter-group input[type="text"]');
    if (locationInput) {
        let locationTimeout;
        locationInput.addEventListener('input', function() {
            clearTimeout(locationTimeout);
            locationTimeout = setTimeout(() => {
                const query = document.getElementById('search-input')?.value.trim() || '';
                const filters = getCurrentFilters();
                const sortBy = document.getElementById('sort-select')?.value || 'newest';
                performSearch(query, filters, sortBy);
            }, 300);
        });
    }

    // Rating radio buttons
    const ratingRadios = document.querySelectorAll('input[name="rating"]');
    ratingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const query = document.getElementById('search-input')?.value.trim() || '';
            const filters = getCurrentFilters();
            const sortBy = document.getElementById('sort-select')?.value || 'newest';
            performSearch(query, filters, sortBy);
        });
    });

    // Clear filters button
    const clearFiltersBtn = document.querySelector('.clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Reset all form inputs
            document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
            
            if (priceMin) priceMin.value = 0;
            if (priceMax) priceMax.value = 500;
            if (locationInput) locationInput.value = '';

            // Update price labels
            const labels = document.querySelector('.price-labels');
            if (labels) {
                labels.innerHTML = '<span>₹0</span><span>₹500+</span>';
            }

            // Perform search with cleared filters
            const query = document.getElementById('search-input')?.value.trim() || '';
            const sortBy = document.getElementById('sort-select')?.value || 'newest';
            performSearch(query, {}, sortBy);
        });
    }
}

// Set up pagination handlers
function setupPaginationHandlers() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (!this.disabled) {
                const currentState = window.KinshipSearch.getCurrentSearchState();
                const newPage = Math.max(1, currentState.page - 1);
                performSearch(
                    currentState.filters.search || '',
                    currentState.filters,
                    currentState.sort,
                    newPage
                );
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (!this.disabled) {
                const currentState = window.KinshipSearch.getCurrentSearchState();
                const newPage = currentState.page + 1;
                performSearch(
                    currentState.filters.search || '',
                    currentState.filters,
                    currentState.sort,
                    newPage
                );
            }
        });
    }
}

// Update pagination controls
function updatePagination(pagination) {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (prevBtn) {
        prevBtn.disabled = !pagination.hasPrevPage;
    }

    if (nextBtn) {
        nextBtn.disabled = !pagination.hasNextPage;
    }

    if (pageInfo) {
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    }
}

// Update URL with search parameters
function updateURL(query, filters) {
    const url = new URL(window.location);
    
    if (query) {
        url.searchParams.set('search', query);
    } else {
        url.searchParams.delete('search');
    }

    if (filters.category) {
        url.searchParams.set('category', filters.category);
    } else {
        url.searchParams.delete('category');
    }

    window.history.replaceState({}, '', url);
}

// Item detail page initialization
function initializeItemDetailPage() {
    console.log('Initializing item detail page...');
    // This will be implemented in components.js
}

// Profile page initialization
function initializeProfilePage() {
    console.log('Initializing profile page...');
    // This will be implemented in auth.js
}

// List item page initialization
function initializeListItemPage() {
    console.log('Initializing list item page...');
    // This will be implemented in listings.js
}

// Auth page initialization
function initializeAuthPage() {
    console.log('Initializing auth page...');
    // This will be implemented in auth.js
}

// Load featured items for homepage
function loadFeaturedItems() {
    const featuredItemsContainer = document.getElementById('featured-items');
    if (!featuredItemsContainer) {
        console.log('Featured items container not found');
        return;
    }
    
    console.log('Loading featured items...');
    console.log('Storage available:', !!window.KinshipStorage);
    console.log('Components available:', !!window.Components);
    
    // Check if storage and components are available
    if (window.KinshipStorage && window.Components && window.Components.ItemCard) {
        // Featured item IDs from existing listings
        const featuredItemIds = [
            '1757269242471', // Sony Alpha ILCE-7M3K Full-Frame 24.2MP
            '1757268599055', // Olive Green Blazer
            '1757268789151'  // Crewneck Sweatshirt & Sweatpants
        ];
        
        // Clear container
        featuredItemsContainer.innerHTML = '';
        
        // Get featured items from storage
        const allItems = window.KinshipStorage.getItems() || [];
        console.log('Total items in storage:', allItems.length);
        
        const featuredItems = allItems.filter(item => featuredItemIds.includes(item.id));
        console.log('Featured items found:', featuredItems.length);
        
        if (featuredItems.length > 0) {
            // Sort featured items by the order in featuredItemIds array
            featuredItems.sort((a, b) => {
                return featuredItemIds.indexOf(a.id) - featuredItemIds.indexOf(b.id);
            });
            
            // Display featured items
            featuredItems.forEach(item => {
                const itemCard = new window.Components.ItemCard(item);
                featuredItemsContainer.appendChild(itemCard.render());
            });
        } else {
            // Try to get any 3 items if featured items not found
            console.log('Featured items not found, trying to get any 3 items...');
            const anyItems = allItems.slice(0, 3);
            
            if (anyItems.length > 0) {
                anyItems.forEach(item => {
                    const itemCard = new window.Components.ItemCard(item);
                    featuredItemsContainer.appendChild(itemCard.render());
                });
            } else {
                featuredItemsContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6b7280;">
                        <p>No items available. Add some items to see them featured here!</p>
                    </div>
                `;
            }
        }
    } else {
        // Retry loading after a delay if modules not ready
        console.log('Modules not ready, retrying...');
        setTimeout(() => {
            loadFeaturedItems();
        }, 500);
    }
}

// Utility Functions

// Set URL parameter without page reload
function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}



// Initialize sample data if needed
function initializeSampleDataIfNeeded() {
    if (!window.KinshipStorage) {
        console.warn('Storage not available, skipping sample data initialization');
        return;
    }
    
    // Check if we already have items in storage
    const existingItems = window.KinshipStorage.getItems();
    if (existingItems && existingItems.length > 0) {
        console.log('Sample data already exists, skipping initialization');
        return;
    }

    console.log('Initializing sample data...');

    try {
        // DISABLED: Automatic sample data loading
        // To manually load sample data, run in console: window.populateSampleData(true)
        if (typeof window.populateSampleData === 'function') {
            // window.populateSampleData(); // DISABLED - No automatic loading
            console.log('Sample data function available but auto-loading is disabled.');
            console.log('To load sample data manually, run: window.populateSampleData(true)');
        } else {
            console.warn('Sample data initialization function not available');
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Verify data persistence across browser sessions
function verifyDataPersistence() {
    console.log('Verifying data persistence...');
    
    const testKey = 'kinship_persistence_test';
    const testValue = { timestamp: Date.now(), test: true };
    
    try {
        // Save test data
        localStorage.setItem(testKey, JSON.stringify(testValue));
        
        // Retrieve test data
        const retrieved = JSON.parse(localStorage.getItem(testKey));
        
        if (retrieved && retrieved.test === true) {
            console.log('✓ Data persistence verified');
            localStorage.removeItem(testKey); // Clean up
            return true;
        } else {
            console.error('✗ Data persistence verification failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Data persistence error:', error);
        return false;
    }
}

// Update the initializeApp function to include sample data
function initializeApp() {
    console.log('Initializing Kinship App...');
    
    // DISABLED: Automatic sample data loading
    // To manually load sample data, run in console: window.populateSampleData(true)
    if (window.KinshipStorage && window.populateSampleData) {
        // window.populateSampleData(); // DISABLED - No automatic loading
        console.log('[Main] Sample data auto-loading is disabled');
    }
    
    // Initialize navigation
    initializeNavigation();
    
    // Check authentication state
    checkAuthenticationState();
    
    // Initialize page-specific functionality
    initializePageFunctionality();
    
    // Mark app as initialized
    window.KinshipApp.isInitialized = true;
    
    console.log('Kinship App initialized successfully');
}

// DISABLED: Automatic sample data loading on app start
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sample data if storage is empty - DISABLED
    setTimeout(() => {
        if (window.KinshipStorage && window.populateSampleData) {
            // window.populateSampleData(); // DISABLED - No automatic loading
            console.log('[DOMContentLoaded] Sample data auto-loading is disabled');
            console.log('To load sample data, run: window.populateSampleData(true)');
        }
    }, 100);
});
