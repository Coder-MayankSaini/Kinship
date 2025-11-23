import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ItemCard from '../components/ItemCard'
import { storageService } from '../services/storageService'
import { getSampleListings } from '../utils/sampleData'
import { debounce } from '../utils/helpers'

function BrowsePage() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filters, setFilters] = useState({
    categories: [],
    priceMin: 0,
    priceMax: 10000,
    location: '',
    rating: 0
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Load items on mount
  useEffect(() => {
    loadItems()
    
    // Check URL parameters
    const searchFromUrl = searchParams.get('search') || ''
    const categoryFromUrl = searchParams.get('category') || ''
    
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }
    
    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryFromUrl]
      }))
    }
  }, [])

  const loadItems = () => {
    let listings = storageService.getListings()
    
    if (listings.length === 0) {
      // Use sample data if no listings exist
      listings = getSampleListings()
    }
    
    setItems(listings)
    setFilteredItems(listings)
  }

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query) => {
      applyFiltersAndSort()
    }, 300),
    [filters, sortBy]
  )

  // Handle search input change
  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery])

  // Apply filters when they change
  useEffect(() => {
    applyFiltersAndSort()
  }, [filters, sortBy, items])

  const applyFiltersAndSort = () => {
    let filtered = [...items]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(item =>
        filters.categories.includes(item.category)
      )
    }

    // Apply price filter
    filtered = filtered.filter(item => {
      const price = item.pricing?.daily || 0
      return price >= filters.priceMin && price <= filters.priceMax
    })

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(item =>
        item.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(item =>
        (item.rating || 0) >= filters.rating
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.pricing?.daily || 0) - (b.pricing?.daily || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.pricing?.daily || 0) - (a.pricing?.daily || 0))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
      default:
        // Items are already in newest first order
        break
    }

    setFilteredItems(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleCategoryChange = (category) => {
    setFilters(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
      return { ...prev, categories }
    })
  }

  const handlePriceRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: parseInt(value)
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceMin: 0,
      priceMax: 10000,
      location: '',
      rating: 0
    })
    setSearchQuery('')
    setSortBy('newest')
  }

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredItems.slice(startIndex, endIndex)

  return (
    <div className="browse-page" role="main">
      <div className="page-header">
        <h1 id="browse-heading">Browse Items</h1>
        <p className="subtitle">Find the perfect item to rent from our community</p>
        <div className="search-controls">
          <label htmlFor="search-input" className="sr-only">Search items</label>
          <input
            type="text"
            id="search-input"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-describedby="search-help"
          />
          <span id="search-help" className="sr-only">Enter keywords to search for rental items</span>
          
          <label htmlFor="sort-select" className="sr-only">Sort results by</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort search results"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="browse-content">
        <aside className="filter-sidebar" role="complementary" aria-labelledby="filters-heading">
          <h3 id="filters-heading">Filters</h3>

          <div className="filter-group" role="group" aria-labelledby="category-heading">
            <h4 id="category-heading">Category</h4>
            <div className="filter-options">
              {['electronics', 'tools', 'sports', 'home-garden', 'automotive', 'clothing', 'books', 'other'].map(category => (
                <label key={category}>
                  <input
                    type="checkbox"
                    name="category"
                    value={category}
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    aria-describedby="category-heading"
                  />
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' & ')}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group" role="group" aria-labelledby="price-heading">
            <h4 id="price-heading">Price Range</h4>
            <div className="price-range">
              <label htmlFor="price-min" className="sr-only">Minimum price</label>
              <input
                type="range"
                id="price-min"
                min="0"
                max="10000"
                value={filters.priceMin}
                onChange={(e) => handlePriceRangeChange('priceMin', e.target.value)}
                aria-label="Minimum price"
              />
              
              <label htmlFor="price-max" className="sr-only">Maximum price</label>
              <input
                type="range"
                id="price-max"
                min="0"
                max="10000"
                value={filters.priceMax}
                onChange={(e) => handlePriceRangeChange('priceMax', e.target.value)}
                aria-label="Maximum price"
              />
              
              <div className="price-labels" aria-hidden="true">
                <span>₹{filters.priceMin}</span>
                <span>₹{filters.priceMax}</span>
              </div>
            </div>
          </div>

          <div className="filter-group" role="group" aria-labelledby="location-heading">
            <h4 id="location-heading">Location</h4>
            <label htmlFor="location-filter" className="sr-only">Filter by location</label>
            <input
              type="text"
              id="location-filter"
              placeholder="Enter location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              aria-describedby="location-heading"
            />
          </div>

          <div className="filter-group" role="group" aria-labelledby="rating-heading">
            <h4 id="rating-heading">Rating</h4>
            <div className="rating-filter">
              {[4, 3, 2].map(rating => (
                <label key={rating}>
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={filters.rating === rating}
                    onChange={() => setFilters(prev => ({ ...prev, rating }))}
                    aria-describedby="rating-heading"
                  />
                  <span aria-hidden="true">{rating}+ Stars</span>
                  <span className="sr-only">{rating} stars and above</span>
                </label>
              ))}
            </div>
          </div>

          <button className="clear-filters" onClick={clearAllFilters} aria-label="Clear all applied filters">
            Clear All Filters
          </button>
        </aside>

        <section className="items-section" role="main" aria-labelledby="results-heading">
          <div className="results-info">
            <h2 id="results-heading" className="sr-only">Search Results</h2>
            <span id="results-count" aria-live="polite" aria-atomic="true">
              {filteredItems.length} items found
            </span>
          </div>

          <div className="items-grid" id="items-grid" role="list" aria-label="Rental items" aria-live="polite">
            {currentItems.length > 0 ? (
              currentItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="no-results">
                <h3>No items found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" role="navigation" aria-label="Search results pagination">
              <button
                id="prev-page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                aria-label="Go to previous page"
              >
                Previous
              </button>
              <span id="page-info" aria-live="polite">
                Page {currentPage} of {totalPages}
              </span>
              <button
                id="next-page"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                aria-label="Go to next page"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}

export default BrowsePage
