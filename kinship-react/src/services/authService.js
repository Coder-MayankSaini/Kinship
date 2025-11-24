
import { supabase } from '../supabaseClient'

class AuthService {
  constructor() {
    this.currentUser = null
  }

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Fetch profile
    const profile = await this._fetchProfile(data.user.id)

    // Merge auth user and profile
    const user = {
      ...data.user,
      ...profile,
      id: data.user.id, // Ensure ID is top level
      email: data.user.email
    }

    this.currentUser = user
    return user
  }

  async register(userData) {
    // 1. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
        }
      }
    })

    if (error) throw error

    if (data.user) {
      // 2. Update the automatically created profile with extra details
      // The trigger created the basic profile. We update it with the rest.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          location: userData.location,
          bio: userData.bio,
          // Add other fields as needed
        })
        .eq('id', data.user.id)

      if (profileError) console.error('Error updating profile:', profileError)

      // Return the user object
      const profile = await this._fetchProfile(data.user.id)
      const user = {
        ...data.user,
        ...profile,
        id: data.user.id,
        email: data.user.email
      }
      this.currentUser = user
      return user
    }
    return null
  }

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    this.currentUser = null
  }

  async getCurrentUser() {
    // Check active session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    // If we already have the full user in memory, return it
    if (this.currentUser && this.currentUser.id === session.user.id) {
      return this.currentUser
    }

    // Otherwise fetch profile and rebuild user object
    const profile = await this._fetchProfile(session.user.id)
    const user = {
      ...session.user,
      ...profile,
      id: session.user.id,
      email: session.user.email
    }

    this.currentUser = user
    return user
  }

  async _fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return {}
    }

    // Map snake_case to camelCase for app compatibility
    return {
      profile: { // Nest under 'profile' to match existing app structure
        name: data.name,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        location: data.location,
        bio: data.bio,
        avatar: data.avatar,
        joinedDate: data.joined_date,
        rating: data.rating,
        reviewCount: data.review_count
      }
    }
  }
}

export const authService = new AuthService()
