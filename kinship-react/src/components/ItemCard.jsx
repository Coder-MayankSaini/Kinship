import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storageService } from '../services/storageService'
import { formatCurrency } from '../utils/helpers'

function ItemCard({ item, showFavorite = true, clickable = true }) {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [isFavorited, setIsFavorited] = useState(
    currentUser ? storageService.isFavorite(currentUser.id, item.id) : false
  )

  const handleClick = () => {
    if (clickable) {
      navigate(`/item/${item.id}`)
    }
  }

  const handleFavoriteToggle = (e) => {
    e.stopPropagation()
    
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

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    let stars = ''
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '★'
      } else if (i === fullStars && hasHalfStar) {
        stars += '☆'
      } else {
        stars += '☆'
      }
    }
    return stars
  }

  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'

  return (
    <div 
      className="item-card" 
      data-item-id={item.id}
      onClick={handleClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <img 
        src={imageUrl} 
        alt={item.title} 
        className="item-card-image" 
        loading="lazy"
      />
      
      {showFavorite && currentUser && (
        <button 
          className={`item-card-favorite ${isFavorited ? 'favorited' : ''}`}
          onClick={handleFavoriteToggle}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <span className="heart-icon">{isFavorited ? '♥' : '♡'}</span>
        </button>
      )}
      
      <div className="item-card-content">
        <h3 className="item-card-title">{item.title}</h3>
        <div className="item-card-price">
          {formatCurrency(item.pricing?.daily || 0)}/day
        </div>
        <div className="item-card-location">{item.location}</div>
        <div className="item-card-rating">
          <span className="item-card-stars">{renderStars(item.rating || 0)}</span>
          <span>{(item.rating || 0).toFixed(1)} ({item.reviewCount || 0})</span>
        </div>
      </div>
    </div>
  )
}

export default ItemCard
