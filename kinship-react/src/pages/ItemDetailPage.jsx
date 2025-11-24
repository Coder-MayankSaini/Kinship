import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storageService } from '../services/storageService'
import { supabaseService } from '../services/supabaseService'
import { getSampleListings } from '../utils/sampleData'
import { formatCurrency, formatDate, calculateRentalTotal } from '../utils/helpers'

function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [item, setItem] = useState(null)
  const [mainImage, setMainImage] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [showRentalModal, setShowRentalModal] = useState(false)
  const [rentalDates, setRentalDates] = useState({ start: '', end: '' })
  const [rentalMessage, setRentalMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [canReview, setCanReview] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    loadItem()
    loadReviews()
  }, [id])

  useEffect(() => {
    if (item && currentUser) {
      setIsFavorited(storageService.isFavorite(currentUser.id, item.id))
      checkReviewEligibility()
    }
  }, [item, currentUser])

  const loadItem = async () => {
    let foundItem = await supabaseService.getListingById(id)

    if (!foundItem) {
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

  const loadReviews = async () => {
    const itemReviews = await supabaseService.getReviews(id)
    setReviews(itemReviews)
  }

  const checkReviewEligibility = async () => {
    if (!currentUser) return
    const hasBooked = await supabaseService.hasUserBookedItem(currentUser.id, id)
    setCanReview(hasBooked)
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

  const isOwner = currentUser && item && (
    (typeof item.owner === 'object' && item.owner?.id === currentUser.id) ||
    item.owner_id === currentUser.id
  )

  const handleRentNow = () => {
    if (isOwner) {
      alert("You cannot rent your own item!")
      return
    }

    if (!currentUser) {
      navigate('/auth', { state: { from: location.pathname } })
      return
    }
    setShowRentalModal(true)
  }

  const handleRentalSubmit = async (e) => {
    e.preventDefault()

    if (!rentalDates.start || !rentalDates.end) {
      alert('Please select rental dates')
      return
    }

    // Check if it's a sample item (ID is not a UUID)
    // Simple check: UUIDs are 36 characters long
    if (item.id.length < 30) {
      alert('This is a sample item and cannot be rented. Please create a real listing to test renting.')
      return
    }

    const ownerId = typeof item.owner === 'object' ? item.owner?.id : item.owner_id

    if (!ownerId || ownerId === 'unknown') {
      alert('Cannot rent this item: Owner information is missing.')
      return
    }

    const booking = {
      itemId: item.id,
      userId: currentUser.id,
      ownerId: ownerId,
      startDate: rentalDates.start,
      endDate: rentalDates.end,
      message: rentalMessage,
      status: 'pending',
      totalCost: calculateRentalTotal(item.pricing.daily, rentalDates.start, rentalDates.end)
    }

    try {
      await supabaseService.saveBooking(booking)
      setShowRentalModal(false)
      alert('Booking request sent successfully!')
      navigate('/profile')
    } catch (error) {
      console.error('Error creating booking:', error)
      alert(`Failed to create booking: ${error.message || 'Unknown error'}`)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      setSubmittingReview(true)

      // We need a booking ID to link the review. 
      // For simplicity, we'll fetch the latest booking ID for this user and item.
      // Ideally, the UI would let them select which booking to review if multiple exist.
      const bookings = await supabaseService.getUserBookings(currentUser.id)
      const booking = bookings.find(b => b.item_id === id)

      if (!booking) {
        alert('No booking found to review.')
        return
      }

      await supabaseService.saveReview({
        itemId: id,
        userId: currentUser.id,
        bookingId: booking.id,
        rating: newReview.rating,
        comment: newReview.comment
      })

      setNewReview({ rating: 5, comment: '' })
      loadReviews() // Reload reviews
      alert('Review submitted!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
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
              ({reviews.length} reviews)
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
            <button
              className="rent-now-btn"
              onClick={handleRentNow}
              disabled={isOwner}
              style={isOwner ? { background: '#ccc', cursor: 'not-allowed' } : {}}
            >
              {isOwner ? 'You Own This Item' : 'Rent Now'}
            </button>
            <button className="contact-owner-btn" onClick={() => alert('Contact feature coming soon!')} disabled={isOwner}>
              Contact Owner
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section" style={{ marginTop: '40px', padding: '20px', background: '#fff', borderRadius: '8px' }}>
        <h2>Reviews</h2>

        {canReview && (
          <div className="write-review" style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3>Write a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label>Rating:</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  style={{ padding: '8px', marginLeft: '10px' }}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows="4"
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submittingReview} style={{ marginTop: '10px' }}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="review-item" style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span className="reviewer-name" style={{ fontWeight: 'bold' }}>
                    {review.user?.name || 'User'}
                  </span>
                  <span className="review-date" style={{ color: '#666', fontSize: '0.9em' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="review-rating" style={{ color: '#f59e0b', marginBottom: '5px' }}>
                  {renderStars(review.rating)}
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

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
        <div className="modal active" role="dialog" aria-labelledby="rental-modal-title" aria-modal="true">
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
