import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storageService } from '../services/storageService'
import { generateId } from '../utils/helpers'

function ListItemPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    images: [],
    dailyPrice: '',
    weeklyPrice: '',
    securityDeposit: '',
    availabilityType: 'always',
    specificDates: []
  })
  const [errors, setErrors] = useState({})

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/auth', { state: { from: '/list-item' } })
    }
  }, [currentUser, navigate])

  const validateStep = (step) => {
    const newErrors = {}
    
    switch (step) {
      case 1:
        if (!formData.title || formData.title.length < 5) {
          newErrors.title = 'Title must be at least 5 characters'
        }
        if (!formData.category) {
          newErrors.category = 'Please select a category'
        }
        if (!formData.description || formData.description.length < 20) {
          newErrors.description = 'Description must be at least 20 characters'
        }
        if (!formData.location) {
          newErrors.location = 'Location is required'
        }
        break
      case 2:
        if (formData.images.length === 0) {
          newErrors.images = 'Please add at least one image URL'
        }
        break
      case 3:
        if (!formData.dailyPrice || parseFloat(formData.dailyPrice) <= 0) {
          newErrors.dailyPrice = 'Please enter a valid daily price'
        }
        if (formData.weeklyPrice && parseFloat(formData.weeklyPrice) >= parseFloat(formData.dailyPrice) * 7) {
          newErrors.weeklyPrice = 'Weekly price should offer a discount'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageAdd = () => {
    const imageUrl = prompt('Enter image URL:')
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }))
    }
  }

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    if (!currentUser) {
      alert('Please log in to list an item')
      return
    }

    const newListing = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      images: formData.images,
      pricing: {
        daily: parseFloat(formData.dailyPrice),
        weekly: formData.weeklyPrice ? parseFloat(formData.weeklyPrice) : null,
        monthly: null
      },
      deposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : 0,
      owner: {
        id: currentUser.id,
        name: currentUser.profile?.name || currentUser.email,
        rating: currentUser.profile?.rating || 0
      },
      availability: formData.availabilityType === 'always',
      availableDates: formData.specificDates,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    }

    storageService.saveListing(newListing)
    alert('Item listed successfully!')
    navigate('/profile')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step active" data-step="1">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label htmlFor="item-title">Item Title *</label>
              <input
                type="text"
                id="item-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Professional DSLR Camera"
                required
              />
              {errors.title && <span className="error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="item-category">Category *</label>
              <select
                id="item-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="tools">Tools & Equipment</option>
                <option value="sports">Sports & Recreation</option>
                <option value="home-garden">Home & Garden</option>
                <option value="automotive">Automotive</option>
                <option value="clothing">Clothing & Accessories</option>
                <option value="books">Books & Media</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <span className="error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="item-description">Description *</label>
              <textarea
                id="item-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Describe your item in detail. Include condition, features, and any important information for renters."
                required
              />
              {errors.description && <span className="error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="item-location">Location *</label>
              <input
                type="text"
                id="item-location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, State or ZIP code"
                required
              />
              {errors.location && <span className="error">{errors.location}</span>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="form-step active" data-step="2">
            <h2>Add Photos</h2>
            <p>Add image URLs for your item</p>
            
            <div className="photo-upload-area">
              <button type="button" className="browse-btn" onClick={handleImageAdd}>
                Add Image URL
              </button>
              
              <div className="uploaded-photos">
                {formData.images.map((image, index) => (
                  <div key={index} className="photo-preview">
                    <img src={image} alt={`Item ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-photo" 
                      onClick={() => handleImageRemove(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              {errors.images && <span className="error">{errors.images}</span>}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="form-step active" data-step="3">
            <h2>Set Your Pricing</h2>
            
            <div className="pricing-options">
              <div className="form-group">
                <label htmlFor="daily-price">Daily Rate *</label>
                <div className="price-input">
                  <span className="currency">₹</span>
                  <input
                    type="number"
                    id="daily-price"
                    name="dailyPrice"
                    value={formData.dailyPrice}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    placeholder="25.00"
                    required
                  />
                  <span className="period">/day</span>
                </div>
                {errors.dailyPrice && <span className="error">{errors.dailyPrice}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="weekly-price">Weekly Rate (Optional)</label>
                <div className="price-input">
                  <span className="currency">₹</span>
                  <input
                    type="number"
                    id="weekly-price"
                    name="weeklyPrice"
                    value={formData.weeklyPrice}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    placeholder="150.00"
                  />
                  <span className="period">/week</span>
                </div>
                <small>Offer a discount for weekly rentals</small>
                {errors.weeklyPrice && <span className="error">{errors.weeklyPrice}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="security-deposit">Security Deposit</label>
                <div className="price-input">
                  <span className="currency">₹</span>
                  <input
                    type="number"
                    id="security-deposit"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                  />
                </div>
                <small>Refundable deposit to protect against damage</small>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="form-step active" data-step="4">
            <h2>Set Availability</h2>
            
            <div className="availability-section">
              <div className="availability-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="availabilityType"
                    value="always"
                    checked={formData.availabilityType === 'always'}
                    onChange={handleInputChange}
                  />
                  <span>Available anytime</span>
                </label>
                
                <label className="radio-option">
                  <input
                    type="radio"
                    name="availabilityType"
                    value="specific"
                    checked={formData.availabilityType === 'specific'}
                    onChange={handleInputChange}
                  />
                  <span>Specific dates only</span>
                </label>
              </div>
              
              {formData.availabilityType === 'specific' && (
                <div className="date-picker-section">
                  <p>Date selection feature coming soon. Items will be available anytime for now.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="form-step active" data-step="5">
            <h2>Review Your Listing</h2>
            
            <div className="review-section">
              <h3>Item Details</h3>
              <div className="review-item">
                <span className="review-label">Title:</span>
                <span className="review-value">{formData.title}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Category:</span>
                <span className="review-value">{formData.category}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Description:</span>
                <span className="review-value">{formData.description}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Location:</span>
                <span className="review-value">{formData.location}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Daily Price:</span>
                <span className="review-value">₹{formData.dailyPrice}</span>
              </div>
              {formData.weeklyPrice && (
                <div className="review-item">
                  <span className="review-label">Weekly Price:</span>
                  <span className="review-value">₹{formData.weeklyPrice}</span>
                </div>
              )}
              {formData.securityDeposit && (
                <div className="review-item">
                  <span className="review-label">Security Deposit:</span>
                  <span className="review-value">₹{formData.securityDeposit}</span>
                </div>
              )}
              <div className="review-item">
                <span className="review-label">Images:</span>
                <span className="review-value">{formData.images.length} image(s)</span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <main className="list-item-page">
      <div className="page-header">
        <h1>List Your Item</h1>
        <p>Share your items with the community and earn money</p>
      </div>

      <div className="listing-form-container">
        <div className="form-progress">
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step} 
              className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              data-step={step}
            >
              <span className="step-number">{step}</span>
              <span className="step-label">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Photos'}
                {step === 3 && 'Pricing'}
                {step === 4 && 'Availability'}
                {step === 5 && 'Review'}
              </span>
            </div>
          ))}
        </div>

        <form className="listing-form" onSubmit={(e) => e.preventDefault()}>
          {renderStep()}
          
          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" className="btn-secondary" onClick={handlePrev}>
                Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                List Item
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}

export default ListItemPage
