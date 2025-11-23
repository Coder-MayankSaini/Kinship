import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    phone: '',
    location: '',
    dateOfBirth: '',
    bio: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required'
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required'
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
      
      if (!formData.location) {
        newErrors.location = 'Location is required'
      }
      
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required'
      } else {
        const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
        if (age < 18) {
          newErrors.dateOfBirth = 'You must be at least 18 years old'
        }
      }
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      let success
      if (isLogin) {
        success = await login(formData.email, formData.password)
      } else {
        // Prepare registration data with full name
        const registrationData = {
          ...formData,
          name: `${formData.firstName} ${formData.lastName}`.trim()
        }
        success = await register(registrationData)
      }
      
      if (success) {
        navigate(from, { replace: true })
      }
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabSwitch = (loginTab) => {
    setIsLogin(loginTab)
    setErrors({})
    // Reset form when switching tabs
    setFormData({
      email: '',
      password: '',
      name: '',
      firstName: '',
      lastName: '',
      confirmPassword: '',
      phone: '',
      location: '',
      dateOfBirth: '',
      bio: ''
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Log in to your account' : 'Sign up to get started'}</p>
          </div>

          {errors.general && (
            <div className="error-message" role="alert">
              {errors.general}
            </div>
          )}

          <div className="auth-tabs">
            <button
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => handleTabSwitch(true)}
              type="button"
            >
              Login
            </button>
            <button
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => handleTabSwitch(false)}
              type="button"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    className={errors.location ? 'error' : ''}
                  />
                  {errors.location && <span className="error-text">{errors.location}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.dateOfBirth ? 'error' : ''}
                  />
                  {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">Bio (Optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a little about yourself..."
                    rows="3"
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            {isLogin ? (
              <>
                <p className="auth-switch">
                  Don't have an account? 
                  <button 
                    type="button" 
                    className="link-btn" 
                    onClick={() => handleTabSwitch(false)}
                  >
                    Sign up
                  </button>
                </p>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </>
            ) : (
              <p className="auth-switch">
                Already have an account? 
                <button 
                  type="button" 
                  className="link-btn" 
                  onClick={() => handleTabSwitch(true)}
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
