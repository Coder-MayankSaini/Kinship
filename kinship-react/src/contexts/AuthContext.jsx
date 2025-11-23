import React, { createContext, useContext, useState, useEffect } from 'react'
import { storageService } from '../services/storageService'
import { authService } from '../services/authService'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load current user from storage on mount
    const user = storageService.getCurrentUser()
    if (user) {
      setCurrentUser(user)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password)
      if (user) {
        setCurrentUser(user)
        storageService.setCurrentUser(user)
        return true
      }
      return false
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const user = await authService.register(userData)
      if (user) {
        setCurrentUser(user)
        storageService.setCurrentUser(user)
        return true
      }
      return false
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setCurrentUser(null)
    storageService.clearCurrentUser()
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
