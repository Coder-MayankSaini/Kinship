// Authentication service for managing user authentication
import { storageService } from './storageService'
import { generateId, hashPassword } from '../utils/helpers'

class AuthService {
  constructor() {
    this.currentUser = null
  }

  async login(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = storageService.getUserByEmail(email)
    
    if (!user) {
      throw new Error('No account found with this email')
    }
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== hashPassword(password)) {
      throw new Error('Invalid password')
    }
    
    this.currentUser = user
    return user
  }

  async register(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required')
    }
    
    // Check if user already exists
    const existingUser = storageService.getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error('An account with this email already exists')
    }
    
    // Create new user with all provided data
    const newUser = {
      id: generateId(),
      email: userData.email,
      password: hashPassword(userData.password),
      profile: {
        name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        phone: userData.phone || '',
        location: userData.location || 'Not specified',
        dateOfBirth: userData.dateOfBirth || '',
        bio: userData.bio || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        joinedDate: new Date().toISOString(),
        rating: 0,
        reviewCount: 0,
        itemsListed: 0,
        itemsRented: 0,
        verifiedEmail: false,
        verifiedPhone: false
      },
      settings: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        privacy: {
          showEmail: false,
          showPhone: false,
          showLocation: true
        }
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
    
    // Save user
    storageService.saveUser(newUser)
    this.currentUser = newUser
    
    return newUser
  }

  logout() {
    this.currentUser = null
    storageService.clearCurrentUser()
  }

  async resetPassword(email) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = storageService.getUserByEmail(email)
    if (!user) {
      throw new Error('No account found with this email')
    }
    
    // In production, send reset email
    console.log('Password reset email sent to:', email)
    return true
  }

  getCurrentUser() {
    return this.currentUser || storageService.getCurrentUser()
  }
}

export const authService = new AuthService()
