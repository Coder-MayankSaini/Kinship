# Project Report: Kinship - Peer-to-Peer Rental Platform

## 1. Project Overview
**Name:** Kinship
**Type:** Web Application (Single Page Application)
**Purpose:** A community-driven platform allowing users to rent items from each other (peer-to-peer). It facilitates the sharing economy by enabling users to list items they own and rent items they need.

## 2. Technology Stack
*   **Frontend Framework:** React (v18) with Vite (Build Tool)
*   **Language:** JavaScript (ES6+)
*   **Routing:** React Router DOM (v6)
*   **Styling:** Vanilla CSS (Modular architecture)
*   **Backend / Infrastructure:** Supabase (BaaS - Backend as a Service)
    *   **Database:** PostgreSQL
    *   **Authentication:** Supabase Auth
    *   **Storage:** Supabase Storage (for images)
*   **Deployment:** Netlify (configured for SPA routing)
*   **Version Control:** Git & GitHub

## 3. Key Features Implemented

### A. User Authentication
*   **Sign Up & Login:** Secure email/password authentication via Supabase Auth.
*   **Profile Management:** Automatic profile creation upon signup. Users can update their bio, location, and contact info.
*   **Session Management:** Persistent login state using `AuthContext`.

### B. Listings Management
*   **Create Listing:** Users can list items with title, description, category, price (daily/weekly), location, and images.
*   **Image Upload:** Integration with Supabase Storage to upload and host item images (limit 4 per item).
*   **Browse & Search:** Users can view all items, filter by category, and search by keywords.
*   **Item Details:** Detailed view showing images, pricing, owner info, specifications, and availability.

### C. Booking System
*   **Rent Items:** Users can select start/end dates to rent an item.
*   **Cost Calculation:** Automatic calculation of total cost based on daily rate and duration.
*   **Validation:**
    *   Prevents selecting past dates.
    *   **Self-Rent Prevention:** Owners cannot rent their own items.
    *   **Availability Check:** (Basic implementation) Checks if dates are valid.
*   **Booking Management:**
    *   **Renter View:** See active and past rentals in Profile.
    *   **Owner View:** See incoming booking requests in Profile.

### D. Reviews & Ratings
*   **Review System:** 5-star rating and text comment system.
*   **Verification:** Only users who have successfully booked and rented an item can leave a review for it.
*   **Public Display:** Average rating and review count displayed on item cards and detail pages.

## 4. Database Schema (Supabase PostgreSQL)

### Tables
1.  **`public.listings`**
    *   `id` (UUID, PK): Unique item ID.
    *   `title`, `description`, `category`, `location`: Item details.
    *   `pricing` (JSONB): Stores `{ daily, weekly, monthly }` rates.
    *   `owner_id` (UUID, FK): Links to `auth.users`.
    *   `images` (Text Array): URLs of uploaded images.
    *   `created_at`: Timestamp.

2.  **`public.profiles`**
    *   `id` (UUID, PK, FK): Links to `auth.users`.
    *   `name`, `email`, `avatar`: User display info.
    *   `rating`, `review_count`: Aggregated user reputation.

3.  **`public.bookings`**
    *   `id` (UUID, PK): Unique booking ID.
    *   `item_id` (UUID, FK): Item being rented.
    *   `user_id` (UUID, FK): Renter ID.
    *   `owner_id` (UUID, FK): Owner ID.
    *   `start_date`, `end_date`: Rental period.
    *   `total_cost`: Final price.
    *   `status`: 'pending', 'confirmed', 'completed', 'cancelled'.

4.  **`public.reviews`**
    *   `id` (UUID, PK): Unique review ID.
    *   `item_id` (UUID, FK): Item being reviewed.
    *   `user_id` (UUID, FK): Reviewer ID.
    *   `booking_id` (UUID, FK, Unique): Links review to a specific transaction.
    *   `rating` (1-5), `comment`: Review content.

### Security (RLS Policies)
*   **Listings:** Public read access. Only owners can update/delete. Authenticated users can insert.
*   **Bookings:** Users can only view their own bookings (as renter or owner).
*   **Reviews:** Public read access. Only verified renters (via `booking_id`) can insert.

## 5. Project Structure
```
kinship-react/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI (ItemCard, Layout, Navbar)
│   ├── contexts/        # Global State (AuthContext)
│   ├── pages/           # Route Views
│   │   ├── HomePage.jsx
│   │   ├── BrowsePage.jsx
│   │   ├── ItemDetailPage.jsx  (Booking & Review logic here)
│   │   ├── ListItemPage.jsx    (Create listing & Upload logic)
│   │   ├── ProfilePage.jsx     (Dashboard for bookings/rentals)
│   │   └── AuthPage.jsx
│   ├── services/        # API Layers
│   │   ├── supabaseClient.js   (Supabase initialization)
│   │   ├── supabaseService.js  (Data operations: fetch, save, upload)
│   │   └── authService.js      (Auth operations: login, register)
│   ├── styles/          # CSS Files (Modular per page)
│   └── utils/           # Helpers (Formatting, Date calculations)
├── netlify.toml         # Deployment configuration
└── package.json         # Dependencies
```

## 6. Future Improvements (Roadmap)
*   **Payment Integration:** Stripe/Razorpay for real money transactions.
*   **Real-time Chat:** Messaging between renter and owner.
*   **Advanced Availability:** Calendar blocking for confirmed dates.
*   **Admin Dashboard:** For content moderation.
