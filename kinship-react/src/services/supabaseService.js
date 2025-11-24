
import { supabase } from '../supabaseClient'

export const supabaseService = {
    // Helper to map DB result to App format
    _mapFromDb(listing) {
        if (!listing) return null
        return {
            ...listing,
            reviewCount: listing.review_count,
            createdAt: listing.created_at,
            availableDates: listing.available_dates,
            // pricing, owner, images are likely JSONB and match
        }
    },

    // Helper to map App format to DB format
    _mapToDb(listing) {
        const { reviewCount, createdAt, availableDates, ...rest } = listing
        return {
            ...rest,
            review_count: reviewCount,
            created_at: createdAt,
            available_dates: availableDates
        }
    },

    // Listings
    async getListings() {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching listings:', error)
            return []
        }
        return data.map(listing => this._mapFromDb(listing))
    },

    async getListingById(id) {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching listing:', error)
            return null
        }
        return this._mapFromDb(data)
    },

    async getListingsByOwner(ownerId) {
        // Try to query assuming `owner` is a JSONB column and we want to match `owner->>id`.
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('owner->>id', ownerId)

        if (error) {
            // Fallback: maybe it's owner_id?
            console.warn('Error fetching by owner->>id, trying owner_id', error)
            const { data: data2, error: error2 } = await supabase
                .from('listings')
                .select('*')
                .eq('owner_id', ownerId)

            if (error2) {
                console.error('Error fetching user listings:', error2)
                return []
            }
            return data2.map(listing => this._mapFromDb(listing))
        }
        return data.map(listing => this._mapFromDb(listing))
    },

    async saveListing(listing) {
        const dbListing = this._mapToDb(listing)

        // If the listing has an ID, it might be an update.
        if (dbListing.id) {
            const { data, error } = await supabase
                .from('listings')
                .upsert(dbListing)
                .select()

            if (error) throw error
            return this._mapFromDb(data[0])
        } else {
            const { data, error } = await supabase
                .from('listings')
                .insert(dbListing)
                .select()

            if (error) throw error
            return this._mapFromDb(data[0])
        }
    },

    async searchListings(query) {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .ilike('title', `%${query}%`)

        if (error) {
            console.error('Error searching listings:', error)
            return []
        }
        return data.map(listing => this._mapFromDb(listing))
    },

    // Bookings
    async saveBooking(booking) {
        // Map app booking to DB booking
        const dbBooking = {
            item_id: booking.itemId,
            user_id: booking.userId,
            owner_id: booking.ownerId,
            start_date: booking.startDate,
            end_date: booking.endDate,
            total_cost: booking.totalCost,
            status: booking.status,
            message: booking.message
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert(dbBooking)
            .select()

        if (error) throw error
        return data[0]
    },

    async getUserBookings(userId) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, listings(*)') // Join with listings to get item details
            .or(`user_id.eq.${userId},owner_id.eq.${userId}`)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching bookings:', error)
            return []
        }
        return data
    },

    // Reviews
    async getReviews(itemId) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(*)') // Join with profiles to get user info
            .eq('item_id', itemId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching reviews:', error)
            return []
        }
        return data.map(review => ({
            ...review,
            user: review.profiles // Map profile to user
        }))
    },

    async saveReview(review) {
        const dbReview = {
            item_id: review.itemId,
            user_id: review.userId,
            booking_id: review.bookingId,
            rating: review.rating,
            comment: review.comment
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert(dbReview)
            .select()

        if (error) throw error
        return data[0]
    },

    async hasUserBookedItem(userId, itemId) {
        // Check for any confirmed or completed booking
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('user_id', userId)
            .eq('item_id', itemId)
            .limit(1)

        if (error) return false
        return data.length > 0
    },

    // Storage (Images)
    async uploadImage(file) {
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName)

        return publicUrl
    }
}
