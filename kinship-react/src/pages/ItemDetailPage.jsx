import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storageService } from '../services/storageService'
import { getSampleListings } from '../utils/sampleData'
import { formatCurrency, formatDate, calculateRentalTotal } from '../utils/helpers'

function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [item, setItem] = useState(null)
  const [mainImage, setMainImage] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [showRentalModal, setShowRentalModal] = useState(false)
  const [rentalDates, setRentalDates] = useState({ start: '', end: '' })
  const [rentalMessage, setRentalMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItem()
  }, [id])

  useEffect(() => {
    if (item && currentUser) {
      setIsFavorited(storageService.isFavorite(currentUser.id, item.id))
    }
  }, [item, currentUser])

  const loadItem = () => {
    // Try to get item from storage
    let foundItem = storageService.getListingById(id)
    
    if (!foundItem) {
      // Try sample data
      const sampleItems = getSampleListings()
      foundItem = sampleItems.find(i => i.id === id)
    }
    
    if (foundItem) {
      setItem(foundItem)
      setMainImage(foundItem.images?.[0] || 'https://via.placeholder.com/600x400')
      document.title = `${foundItem.title} - Kinship`
    }
    
    setLoading(false)
  }

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      navigate('/auth')
      return
    }

    if (isFavorited) {
      storageService.removeFromFavorites(currentUser.id, item.id)
      setIsFavorited(false)
    } else {
      storageService.addToFavorites(currentUser.id, item.id)
      setIsFavorited(true)
    }
  }

  const handleRentNow = () => {
    if (!currentUser) {
      navigate('/auth', { state: { from: location } })
      return
    }
    setShowRentalModal(true)
  }

  const handleRentalSubmit = (e) => {
    e.preventDefault()
    
    if (!rentalDates.start || !rentalDates.end) {
      alert('Please select rental dates')
      return
    }
    
    const booking = {
      id: Date.now().toString(),
      itemId: item.id,
      userId: currentUser.id,
      ownerId: item.owner?.id || 'unknown',
      startDate: rentalDates.start,
      endDate: rentalDates.end,
      message: rentalMessage,
      status: 'pending',
      totalCost: calculateRentalTotal(item.pricing.daily, rentalDates.start, rentalDates.end),
      createdAt: new Date().toISOString()
    }
    
    storageService.saveBooking(booking)
    setShowRentalModal(false)
    alert('Booking request sent successfully!')
    navigate('/profile')
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < Math.floor(rating) ? 'star filled' : 'star'}>
          {i < Math.floor(rating) ? '★' : '☆'}
        </span>
      )
    }
    return stars
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!item) {
    return (
      <div className="error-page">
        <h1>Item Not Found</h1>
        <p>The item you're looking for doesn't exist.</p>
        <Link to="/browse">Back to Browse</Link>
      </div>
    )
  }

  const rentalDays = rentalDates.start && rentalDates.end
    ? Math.ceil((new Date(rentalDates.end) - new Date(rentalDates.start)) / (1000 * 60 * 60 * 24)) + 1
    : 0
  const totalCost = rentalDays * (item.pricing?.daily || 0)

  return (
    <div className="item-detail-page" role="main">
      <nav className="breadcrumb" aria-label="Breadcrumb navigation">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/browse">Browse</Link></li>
          <li><span aria-current="page">{item.title}</span></li>
        </ol>
      </nav>

      <div className="item-detail-content">
        <div className="item-images" role="img" aria-labelledby="item-title">
          <div className="image-gallery">
            <div className="main-image">
              <img 
                id="main-item-image" 
                src={mainImage} 
                alt={item.title} 
                role="img"
              />
              <button 
                className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <span aria-hidden="true">{isFavorited ? '♥' : '♡'}</span>
              </button>
            </div>
            {item.images && item.images.length > 1 && (
              <div className="thumbnail-images" role="list" aria-label="Item image thumbnails">
                {item.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className={`thumbnail ${mainImage === image ? 'active' : ''}`}
                    onClick={() => setMainImage(image)}
                    role="listitem"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="item-info">
          <h1 id="item-title">{item.title}</h1>
          <div className="item-rating" aria-label="Item rating">
            <span className="stars" aria-hidden="true">
              {renderStars(item.rating || 0)}
            </span>
            <span className="rating-count" aria-label="Number of reviews">
              ({item.reviewCount || 0} reviews)
            </span>
          </div>

          <div className="pricing" aria-labelledby="pricing-heading">
            <h2 id="pricing-heading" className="sr-only">Pricing Information</h2>
            <span className="price" aria-label="Daily rental price">
              {formatCurrency(item.pricing?.daily || 0)}/day
            </span>
            {item.pricing?.weekly && (
              <span className="weekly-price" aria-label="Weekly rental price">
                {formatCurrency(item.pricing.weekly)}/week
              </span>
            )}
          </div>

          <div className="item-description" aria-labelledby="description-heading">
            <h3 id="description-heading">Description</h3>
            <p>{item.description}</p>
          </div>

          <div className="item-specifications" aria-labelledby="specs-heading">
            <h3 id="specs-heading">Specifications</h3>
            <div role="list">
              <div className="spec-item" role="listitem">
                <span className="spec-label">Category:</span>
                <span className="spec-value">{item.category}</span>
              </div>
              <div className="spec-item" role="listitem">
                <span className="spec-label">Location:</span>
                <span className="spec-value">{item.location}</span>
              </div>
              <div className="spec-item" role="listitem">
                <span className="spec-label">Condition:</span>
                <span className="spec-value">{item.condition || 'Good'}</span>
              </div>
              {item.deposit && (
                <div className="spec-item" role="listitem">
                  <span className="spec-label">Security Deposit:</span>
                  <span className="spec-value">{formatCurrency(item.deposit)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rental-actions">
            <button className="rent-now-btn" onClick={handleRentNow}>
              Rent Now
            </button>
            <button className="contact-owner-btn" onClick={() => alert('Contact feature coming soon!')}>
              Contact Owner
            </button>
          </div>
        </div>
      </div>

      <section className="owner-section" aria-labelledby="owner-heading">
        <h2 id="owner-heading">About the Owner</h2>
        <div className="owner-card" role="region" aria-labelledby="owner-heading">
          <div className="owner-avatar">
            <img 
              src={item.owner?.avatar || `https://ui-avatars.com/api/?name=${item.owner?.name || 'Owner'}&background=2563eb&color=fff`}
              alt={item.owner?.name || 'Owner'}
            />
          </div>
          <div className="owner-info">
            <h3>{item.owner?.name || 'Item Owner'}</h3>
            <div className="owner-rating">
              <span className="stars">{renderStars(item.owner?.rating || 0)}</span>
              <span className="rating-text">
                {(item.owner?.rating || 0).toFixed(1)}/5.0
              </span>
            </div>
            <p className="member-since">Member since {formatDate(item.owner?.joinedDate || new Date())}</p>
          </div>
        </div>
      </section>

      {/* Rental Modal */}
      {showRentalModal && (
        <div className="modal" role="dialog" aria-labelledby="rental-modal-title" aria-modal="true">
          <div className="modal-content">
            <button 
              className="close" 
              onClick={() => setShowRentalModal(false)}
              aria-label="Close rental dialog"
            >
              &times;
            </button>
            <h2 id="rental-modal-title">Rent This Item</h2>
            <form onSubmit={handleRentalSubmit}>
              <div className="date-selection">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  type="date"
                  id="start-date"
                  value={rentalDates.start}
                  onChange={(e) => setRentalDates(prev => ({ ...prev, start: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />

                <label htmlFor="end-date">End Date:</label>
                <input
                  type="date"
                  id="end-date"
                  value={rentalDates.end}
                  onChange={(e) => setRentalDates(prev => ({ ...prev, end: e.target.value }))}
                  min={rentalDates.start || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="message-section">
                <label htmlFor="rental-message">Message to Owner (optional):</label>
                <textarea
                  id="rental-message"
                  value={rentalMessage}
                  onChange={(e) => setRentalMessage(e.target.value)}
                  placeholder="Tell the owner about your rental needs..."
                  rows="3"
                />
              </div>

              <div className="rental-summary" aria-labelledby="cost-heading">
                <h3 id="cost-heading" className="sr-only">Cost Breakdown</h3>
                <div className="cost-breakdown" role="table" aria-label="Rental cost breakdown">
                  <div className="cost-line" role="row">
                    <span role="cell">Daily rate:</span>
                    <span role="cell">{formatCurrency(item.pricing?.daily || 0)}</span>
                  </div>
                  <div className="cost-line" role="row">
                    <span role="cell">Number of days:</span>
                    <span role="cell">{rentalDays}</span>
                  </div>
                  <div className="cost-line total" role="row">
                    <span role="cell">Total:</span>
                    <span role="cell">{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="confirm-rental-btn">
                Confirm Rental
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemDetailPage
