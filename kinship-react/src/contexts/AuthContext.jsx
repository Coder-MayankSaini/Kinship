import React, { createContext, useContext, useState, useEffect } from 'react'

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
    // Check active session on mount
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    // We can import supabase here or add a listener method to authService.
    // For simplicity, let's just rely on the initial check and manual updates for now, 
    // or we can import supabase to listen.
    // Let's import supabase to be reactive.
  }, [])

  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password)
      setCurrentUser(user)
      return true
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const user = await authService.register(userData)
      setCurrentUser(user)
      return true
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setCurrentUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
    }
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
