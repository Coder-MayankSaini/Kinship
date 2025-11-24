import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import ItemCard from '../components/ItemCard'
import { storageService } from '../services/storageService'
import { supabaseService } from '../services/supabaseService'
import { getSampleListings } from '../utils/sampleData'
import { formatDate, formatCurrency } from '../utils/helpers'

function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('listings')
  const [userListings, setUserListings] = useState([])
  const [userBookings, setUserBookings] = useState([])
  const [favoriteItems, setFavoriteItems] = useState([])
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  })

  useEffect(() => {
    if (currentUser) {
      loadUserData()
    }
  }, [currentUser, activeTab])

  const loadUserData = async () => {
    // Load user profile data
    setProfileData({
      name: currentUser.profile?.name || '',
      email: currentUser.email || '',
      phone: currentUser.profile?.phone || '',
      location: currentUser.profile?.location || '',
      bio: currentUser.profile?.bio || ''
    })

    // Load user listings
    const myListings = await supabaseService.getListingsByOwner(currentUser.id)
    setUserListings(myListings || [])

    // Load user bookings
    const bookings = await supabaseService.getUserBookings(currentUser.id)
    console.log('Current User ID:', currentUser.id)
    console.log('Fetched Bookings:', bookings)
    bookings.forEach(b => {
      console.log(`Booking ${b.id}: status='${b.status}', owner_id='${b.owner_id}', match=${b.owner_id === currentUser.id}`)
    })
    setUserBookings(bookings)

    // Load favorite items
    if (activeTab === 'favorites') {
      const favoriteIds = storageService.getFavorites(currentUser.id)
      const allItems = [...storageService.getListings(), ...getSampleListings()]
      const favorites = allItems.filter(item => favoriteIds.includes(item.id))
      setFavoriteItems(favorites)
    }
  }

  const handleProfileUpdate = (e) => {
    e.preventDefault()

    // Update user profile in storage
    const updatedUser = {
      ...currentUser,
      profile: {
        ...currentUser.profile,
        ...profileData
      }
    }

    storageService.saveUser(updatedUser)
    storageService.setCurrentUser(updatedUser)
    alert('Profile updated successfully!')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return (
          <div className="tab-panel active" id="listings-panel">
            <div className="panel-header">
              <h2>My Listings</h2>
              <Link to="/list-item" className="add-item-btn">+ Add New Item</Link>
            </div>
            <div className="items-grid">
              {userListings.length > 0 ? (
                userListings.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              ) : (
                <div className="empty-state">
                  <p>You haven't listed any items yet.</p>
                  <Link to="/list-item" className="btn-primary">List Your First Item</Link>
                </div>
              )}
            </div>
          </div>
        )

      case 'rentals':
        return (
          <div className="tab-panel active" id="rentals-panel">
            <h2>My Rentals</h2>
            <div className="rentals-sections">
              <div className="rental-section">
                <h3>Current Rentals</h3>
                <div className="rentals-list">
                  {userBookings.filter(b => b.status === 'active').length > 0 ? (
                    userBookings.filter(b => b.status === 'active').map(booking => (
                      <div key={booking.id} className="rental-item">
                        <h4>Booking #{booking.id.substring(0, 8)}</h4>
                        <p>Item: {booking.listings?.title || 'Unknown Item'}</p>
                        <p>Dates: {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                        <p>Total: {formatCurrency(booking.total_cost)}</p>
                        <p>Status: {booking.status}</p>
                      </div>
                    ))
                  ) : (
                    <p>No current rentals.</p>
                  )}
                </div>
              </div>

              <div className="rental-section">
                <h3>Past Rentals</h3>
                <div className="rentals-list">
                  {userBookings.filter(b => b.status === 'completed').length > 0 ? (
                    userBookings.filter(b => b.status === 'completed').map(booking => (
                      <div key={booking.id} className="rental-item">
                        <h4>Booking #{booking.id.substring(0, 8)}</h4>
                        <p>Item: {booking.listings?.title || 'Unknown Item'}</p>
                        <p>Dates: {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                        <p>Total: {formatCurrency(booking.total_cost)}</p>
                        <p>Status: {booking.status}</p>
                      </div>
                    ))
                  ) : (
                    <p>No past rentals.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'bookings':
        return (
          <div className="tab-panel active" id="bookings-panel">
            <h2>Booking Requests</h2>
            <div className="booking-sections">
              <div className="booking-section">
                <h3>Pending Requests</h3>
                <div className="booking-requests-list">
                  {userBookings.filter(b => b.status === 'pending' && b.ownerId === currentUser.id).length > 0 ? (
                    userBookings.filter(b => b.status === 'pending' && b.owner_id === currentUser.id).map(booking => (
                      <div key={booking.id} className="booking-request">
                        <h4>Booking Request #{booking.id.substring(0, 8)}</h4>
                        <p>Item: {booking.listings?.title || 'Unknown Item'}</p>
                        <p>Requested by: User {booking.user_id.substring(0, 8)}</p>
                        <p>Dates: {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                        <p>Total: {formatCurrency(booking.total_cost)}</p>
                        {booking.message && <p>Message: {booking.message}</p>}
                        <div className="booking-actions">
                          <button className="btn-primary" onClick={() => alert('Accept feature coming soon!')}>Accept</button>
                          <button className="btn-secondary" onClick={() => alert('Decline feature coming soon!')}>Decline</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No pending booking requests.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'favorites':
        return (
          <div className="tab-panel active" id="favorites-panel">
            <h2>Favorite Items</h2>
            <div className="items-grid">
              {favoriteItems.length > 0 ? (
                favoriteItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              ) : (
                <div className="empty-state">
                  <p>You haven't added any favorites yet.</p>
                  <Link to="/browse" className="btn-primary">Browse Items</Link>
                </div>
              )}
            </div>
          </div>
        )

      case 'reviews':
        return (
          <div className="tab-panel active" id="reviews-panel">
            <h2>Reviews</h2>
            <div className="review-sections">
              <div className="review-section">
                <h3>Reviews I've Written</h3>
                <div className="reviews-list">
                  <p>No reviews written yet.</p>
                </div>
              </div>

              <div className="review-section">
                <h3>Reviews About My Items</h3>
                <div className="reviews-list">
                  <p>No reviews received yet.</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="tab-panel active" id="settings-panel">
            <h2>Account Settings</h2>
            <form className="settings-form" onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="settings-name">Full Name</label>
                <input
                  type="text"
                  id="settings-name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-email">Email</label>
                <input
                  type="email"
                  id="settings-email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-phone">Phone Number</label>
                <input
                  type="tel"
                  id="settings-phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-location">Location</label>
                <input
                  type="text"
                  id="settings-location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-bio">Bio</label>
                <textarea
                  id="settings-bio"
                  rows="4"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </form>
          </div>
        )

      default:
        return null
    }
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />
  }

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src={currentUser.profile?.avatar || `https://ui-avatars.com/api/?name=${currentUser.profile?.name || 'User'}&background=2563eb&color=fff`}
              alt="User Avatar"
            />
          </div>
          <div className="profile-details">
            <h1>{currentUser.profile?.name || 'User'}</h1>
            <p>{currentUser.email}</p>
            <p className="member-since">Member since {formatDate(currentUser.profile?.joinedDate || new Date())}</p>
            {currentUser.profile?.rating && (
              <div className="profile-rating">
                <span className="rating-stars">
                  {'★'.repeat(Math.floor(currentUser.profile.rating))}
                  {'☆'.repeat(5 - Math.floor(currentUser.profile.rating))}
                </span>
                <span>({currentUser.profile.reviewCount || 0} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          {['listings', 'rentals', 'bookings', 'favorites', 'reviews', 'settings'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              data-tab={tab}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
