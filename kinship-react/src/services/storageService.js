// Storage service for managing local storage operations

class StorageService {
  constructor() {
    this.STORAGE_KEYS = {
      CURRENT_USER: 'kinship_current_user',
      USERS: 'kinship_users',
      LISTINGS: 'kinship_listings',
      BOOKINGS: 'kinship_bookings',
      FAVORITES: 'kinship_favorites'
    }
  }

  // User methods
  getCurrentUser() {
    const userData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER)
    return userData ? JSON.parse(userData) : null
  }

  setCurrentUser(user) {
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  }

  clearCurrentUser() {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER)
  }

  getUsers() {
    const users = localStorage.getItem(this.STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  }

  saveUser(user) {
    const users = this.getUsers()
    const existingIndex = users.findIndex(u => u.id === user.id)
    
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }
    
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  getUserByEmail(email) {
    const users = this.getUsers()
    return users.find(u => u.email === email)
  }

  // Listings methods
  getListings() {
    const listings = localStorage.getItem(this.STORAGE_KEYS.LISTINGS)
    return listings ? JSON.parse(listings) : []
  }

  saveListing(listing) {
    const listings = this.getListings()
    const existingIndex = listings.findIndex(l => l.id === listing.id)
    
    if (existingIndex >= 0) {
      listings[existingIndex] = listing
    } else {
      listings.push(listing)
    }
    
    localStorage.setItem(this.STORAGE_KEYS.LISTINGS, JSON.stringify(listings))
  }

  getListingById(id) {
    const listings = this.getListings()
    return listings.find(l => l.id === id)
  }

  // Bookings methods
  getBookings() {
    const bookings = localStorage.getItem(this.STORAGE_KEYS.BOOKINGS)
    return bookings ? JSON.parse(bookings) : []
  }

  saveBooking(booking) {
    const bookings = this.getBookings()
    bookings.push(booking)
    localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings))
  }

  getUserBookings(userId) {
    const bookings = this.getBookings()
    return bookings.filter(b => b.userId === userId || b.ownerId === userId)
  }

  // Favorites methods
  getFavorites(userId) {
    const favorites = localStorage.getItem(this.STORAGE_KEYS.FAVORITES)
    const allFavorites = favorites ? JSON.parse(favorites) : {}
    return allFavorites[userId] || []
  }

  addToFavorites(userId, itemId) {
    const favorites = localStorage.getItem(this.STORAGE_KEYS.FAVORITES)
    const allFavorites = favorites ? JSON.parse(favorites) : {}
    
    if (!allFavorites[userId]) {
      allFavorites[userId] = []
    }
    
    if (!allFavorites[userId].includes(itemId)) {
      allFavorites[userId].push(itemId)
    }
    
    localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(allFavorites))
  }

  removeFromFavorites(userId, itemId) {
    const favorites = localStorage.getItem(this.STORAGE_KEYS.FAVORITES)
    const allFavorites = favorites ? JSON.parse(favorites) : {}
    
    if (allFavorites[userId]) {
      allFavorites[userId] = allFavorites[userId].filter(id => id !== itemId)
      localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(allFavorites))
    }
  }

  isFavorite(userId, itemId) {
    const userFavorites = this.getFavorites(userId)
    return userFavorites.includes(itemId)
  }
}

export const storageService = new StorageService()
