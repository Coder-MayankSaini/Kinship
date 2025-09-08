# Kinship - Peer-to-Peer Rental Platform

![Kinship Logo](assets/images/logo.png)

## 🌟 Overview

Kinship is a modern, professional peer-to-peer rental platform that enables users to rent various items from each other within their community. The platform focuses on creating trust and convenience in the sharing economy, allowing people to monetize their unused items while providing affordable access to goods for renters.

## ✨ Features

### 🏠 **Homepage**
- Compelling hero section with search functionality
- Clear 3-step "How It Works" process
- Popular rental categories grid
- Featured rental items showcase
- Customer testimonials

### 🔍 **Browse & Search**
- Advanced filtering (price, location, category, ratings)
- Real-time search with suggestions
- Responsive item grid layout
- Pagination for large result sets
- Sort options (price, rating, distance)

### 📱 **Item Details**
- Interactive image gallery with thumbnails
- Comprehensive item descriptions and specifications
- Availability calendar with booking conflicts
- Owner profile cards with ratings
- Review and rating system
- Clear pricing information

### 👤 **User Management**
- User registration and authentication
- Profile management with avatar upload
- Personal dashboard with statistics
- Account settings and preferences

### 📝 **Listing Management**
- Multi-step listing creation form
- Photo upload with drag-and-drop
- Pricing and availability settings
- Item status management (active/inactive)
- Edit and delete listings

### 💼 **Rental System**
- Booking requests and confirmations
- Rental history tracking
- Status management (pending, active, completed)
- Message system between users
- Calendar integration

### ⭐ **Reviews & Ratings**
- 5-star rating system
- Written reviews for items and users
- Review moderation and display
- Average rating calculations

### 📱 **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Accessible navigation

## 🏗️ Project Structure

```
kinship-rental-platform/
├── 📁 .kiro/                    # Kiro IDE configuration
│   └── specs/                   # Project specifications
├── 📁 assets/                   # Static assets
│   ├── icons/                   # Icon files
│   └── images/                  # Image assets
├── 📁 css/                      # Stylesheets
│   ├── main.css                 # Core styles and layout
│   ├── components.css           # Component-specific styles
│   └── responsive.css           # Responsive design rules
├── 📁 js/                       # JavaScript modules
│   ├── main.js                  # Application entry point
│   ├── router.js                # Client-side routing
│   ├── auth.js                  # Authentication logic
│   ├── storage.js               # Local storage management
│   ├── components.js            # Reusable UI components
│   ├── browse.js                # Browse page functionality
│   ├── item-detail.js           # Item detail page logic
│   ├── profile.js               # User profile management
│   ├── listings.js              # Listing management
│   ├── booking.js               # Rental booking system
│   ├── search.js                # Search functionality
│   ├── utils.js                 # Utility functions
│   ├── accessibility.js         # Accessibility features
│   ├── sample-data.js           # Demo data generation
│   ├── sample-reviews.js        # Demo reviews
│   └── app-finalizer.js         # App initialization
├── 📄 index.html                # Homepage
├── 📄 browse.html               # Browse/search page
├── 📄 item-detail.html          # Item detail page
├── 📄 auth.html                 # Login/registration
├── 📄 profile.html              # User profile
├── 📄 list-item.html            # Create listing
└── 📄 README.md                 # This file
```

## 🔄 User Flow

### 1. **New Visitor Journey**
```
Homepage → Browse Items → Item Details → Register → Book Item
```

### 2. **Returning User Journey**
```
Login → Dashboard → Browse/Search → Book or List Item
```

### 3. **Item Owner Journey**
```
Login → Profile → List New Item → Manage Bookings → Reviews
```

### 4. **Detailed User Flows**

#### **Registration & Authentication**
1. User visits homepage
2. Clicks "Login" or "Sign Up"
3. Fills registration form (name, email, password)
4. Account created and logged in
5. Redirected to profile setup

#### **Browsing & Searching**
1. User enters search term or clicks category
2. Redirected to browse page with filters
3. Applies filters (price, location, category)
4. Views item grid with pagination
5. Clicks item for detailed view

#### **Booking Process**
1. User views item details
2. Checks availability calendar
3. Selects rental dates
4. Clicks "Rent Now"
5. Confirms booking details
6. Booking request sent to owner
7. Owner approves/rejects request
8. User receives confirmation

#### **Listing Creation**
1. User navigates to "List Item"
2. Multi-step form process:
   - Basic info (title, description, category)
   - Photo upload (drag & drop)
   - Pricing (daily/weekly rates)
   - Availability calendar
   - Preview and publish
3. Item goes live on platform

## 🛠️ Technical Architecture

### **Frontend Technologies**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with Flexbox/Grid, animations
- **Vanilla JavaScript**: ES6+ features, modular architecture
- **Local Storage**: Client-side data persistence

### **Key JavaScript Modules**

#### **Core Modules**
- `main.js` - Application initialization and page routing
- `router.js` - Client-side navigation management
- `storage.js` - Local storage abstraction layer
- `utils.js` - Common utility functions

#### **Feature Modules**
- `auth.js` - User authentication and session management
- `components.js` - Reusable UI components (modals, cards, etc.)
- `browse.js` - Search and filtering functionality
- `item-detail.js` - Item display and booking interface
- `profile.js` - User profile and dashboard
- `listings.js` - Item listing management
- `booking.js` - Rental booking system

#### **Enhancement Modules**
- `accessibility.js` - WCAG compliance features
- `sample-data.js` - Demo data for testing
- `app-finalizer.js` - Performance optimizations

### **CSS Architecture**
- `main.css` - Base styles, typography, layout
- `components.css` - Component-specific styling
- `responsive.css` - Mobile-first responsive design

### **Data Storage**
All data is stored locally using browser localStorage:
- User accounts and profiles
- Item listings and details
- Booking requests and history
- Reviews and ratings
- User preferences and settings

## 🚀 Getting Started

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### **Installation**
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Or serve via local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

### **Demo Data**
The application includes sample data for demonstration:
- Pre-populated user accounts
- Sample rental items across categories
- Demo reviews and ratings
- Booking examples

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Mobile Features**
- Touch-friendly interface
- Hamburger navigation menu
- Swipe gestures for image galleries
- Optimized form layouts
- Compressed image loading

## ♿ Accessibility Features

### **WCAG 2.1 Compliance**
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Alternative text for images

### **Accessibility Tools**
- Skip navigation links
- Focus indicators
- Reduced motion support
- Scalable text and UI elements

## 🎨 Design System

### **Color Palette**
- **Primary**: #2563eb (Blue)
- **Secondary**: #059669 (Green)
- **Accent**: #dc2626 (Red)
- **Neutral**: #6b7280 (Gray)
- **Background**: #fafafa (Light Gray)

### **Typography**
- **Primary Font**: Inter
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### **Components**
- Cards with hover effects
- Modal dialogs
- Form elements with validation
- Navigation with active states
- Loading states and skeletons

## 🔧 Development

### **Code Organization**
- Modular JavaScript architecture
- Component-based CSS structure
- Semantic HTML with accessibility
- Progressive enhancement approach

### **Best Practices**
- Mobile-first responsive design
- Performance optimization
- SEO-friendly markup
- Cross-browser compatibility
- Error handling and validation

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| 🏠 Homepage | ✅ Complete | Hero section, categories, how it works |
| 🔍 Browse & Search | ✅ Complete | Filtering, sorting, pagination |
| 📱 Item Details | ✅ Complete | Gallery, booking, reviews |
| 👤 Authentication | ✅ Complete | Login, registration, sessions |
| 📝 Listing Management | ✅ Complete | Create, edit, manage listings |
| 💼 Booking System | ✅ Complete | Requests, confirmations, history |
| ⭐ Reviews & Ratings | ✅ Complete | 5-star system, written reviews |
| 📱 Responsive Design | ✅ Complete | Mobile, tablet, desktop |
| ♿ Accessibility | ✅ Complete | WCAG 2.1 compliant |

## 🤝 Contributing

This project was built as a demonstration of modern web development practices using vanilla technologies. Feel free to explore the code and adapt it for your own projects.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern web standards
- Designed with accessibility in mind
- Optimized for performance and user experience
- Created as part of the Kiro IDE development workflow

---

**Kinship** - Connecting communities through sharing 🤝