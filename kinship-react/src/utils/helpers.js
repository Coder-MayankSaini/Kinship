// Utility helper functions

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function hashPassword(password) {
  // Simple hash for demo purposes - use bcrypt in production
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

export function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString(undefined, options)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function calculateRentalTotal(dailyRate, startDate, endDate) {
  if (!dailyRate || !startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  const total = dailyRate * days
  return isNaN(total) ? 0 : total
}

export function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) {
    return Math.floor(interval) + " years ago"
  }

  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + " months ago"
  }

  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + " days ago"
  }

  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + " hours ago"
  }

  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago"
  }

  return Math.floor(seconds) + " seconds ago"
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
