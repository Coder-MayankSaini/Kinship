import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ItemCard from '../components/ItemCard'
import { storageService } from '../services/storageService'
import { supabaseService } from '../services/supabaseService'
import { getSampleListings } from '../utils/sampleData'

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredItems, setFeaturedItems] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadFeaturedItems()
  }, [])

  const loadFeaturedItems = async () => {
    // Get listings from Supabase
    let listings = await supabaseService.getListings()

    if (!listings || listings.length === 0) {
      // Use sample data if no listings exist
      listings = getSampleListings().slice(0, 8)
    }

    // Get first 8 items as featured
    setFeaturedItems(listings.slice(0, 8))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCategoryClick = (category) => {
    navigate(`/browse?category=${category}`)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-content">
            <h1 id="hero-heading">Rent Anything, Anytime</h1>
            <p>Connect with your community and access the items you need</p>
            <form className="search-bar" onSubmit={handleSearch} role="search" aria-label="Search for rental items">
              <label htmlFor="hero-search" className="sr-only">Search for items to rent</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                id="hero-search"
                aria-describedby="search-help"
              />
              <span id="search-help" className="sr-only">
                Enter keywords to find items available for rent in your area
              </span>
              <button type="submit" aria-label="Search for rental items">Search</button>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" aria-labelledby="how-it-works-heading">
        <div className="container">
          <h2 id="how-it-works-heading">How It Works</h2>
          <div className="steps" role="list" aria-label="Steps to use Kinship">
            <div className="step" role="listitem">
              <div className="step-icon" aria-hidden="true"></div>
              <h3>List</h3>
              <p>List your items for rent and set your own prices</p>
            </div>
            <div className="step" role="listitem">
              <div className="step-icon" aria-hidden="true"></div>
              <h3>Connect</h3>
              <p>Connect with trusted renters in your community</p>
            </div>
            <div className="step" role="listitem">
              <div className="step-icon" aria-hidden="true"></div>
              <h3>Rent</h3>
              <p>Earn money from your unused items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories" aria-labelledby="categories-heading">
        <div className="container">
          <h2 id="categories-heading">Popular Categories</h2>
          <div className="category-grid" role="list" aria-label="Browse rental categories">
            <div className="category-card" role="listitem">
              <button
                className="category-button"
                onClick={() => handleCategoryClick('electronics')}
                aria-label="Browse Electronics category"
              >
                <div className="category-icon" aria-hidden="true" role="presentation"></div>
                <h3>Electronics</h3>
              </button>
            </div>
            <div className="category-card" role="listitem">
              <button
                className="category-button"
                onClick={() => handleCategoryClick('fashion')}
                aria-label="Browse Fashion category"
              >
                <div className="category-icon" aria-hidden="true" role="presentation"></div>
                <h3>Fashion</h3>
              </button>
            </div>
            <div className="category-card" role="listitem">
              <button
                className="category-button"
                onClick={() => handleCategoryClick('sports')}
                aria-label="Browse Sports category"
              >
                <div className="category-icon" aria-hidden="true" role="presentation"></div>
                <h3>Sports</h3>
              </button>
            </div>
            <div className="category-card" role="listitem">
              <button
                className="category-button"
                onClick={() => handleCategoryClick('vehicles')}
                aria-label="Browse Vehicles category"
              >
                <div className="category-icon" aria-hidden="true" role="presentation"></div>
                <h3>Vehicles</h3>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="featured-items" aria-labelledby="featured-heading">
        <div className="container">
          <h2 id="featured-heading">Featured Items</h2>
          <div className="items-grid" role="list" aria-label="Featured rental items" aria-live="polite">
            {featuredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta" aria-labelledby="cta-heading">
        <div className="container">
          <div className="cta-content">
            <h2 id="cta-heading">Ready to Start Renting?</h2>
            <p>Join thousands of users who are already earning money and saving on rentals</p>
            <div className="cta-buttons">
              <button onClick={() => navigate('/auth')} className="btn-primary">Get Started</button>
              <button onClick={() => navigate('/browse')} className="btn-secondary">Browse Items</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
