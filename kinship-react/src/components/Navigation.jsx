import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <header>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/">
              <img src="/assets/images/kinship_logo.webp" alt="Kinship" className="logo-image" />
            </Link>
          </div>
          
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`} id="nav-menu" aria-hidden={!isMenuOpen}>
            <li>
              <Link to="/" className={isActive('/')}>Home</Link>
            </li>
            <li>
              <Link to="/browse" className={isActive('/browse')}>Browse</Link>
            </li>
            <li>
              <Link to="/list-item" className={isActive('/list-item')}>List Item</Link>
            </li>
            {currentUser ? (
              <>
                <li>
                  <Link to="/profile" className={isActive('/profile')}>Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/auth" className={isActive('/auth')}>Login</Link>
              </li>
            )}
          </ul>
          
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="nav-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
      
      {/* Navigation overlay for mobile */}
      <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>
    </header>
  )
}

export default Navigation
