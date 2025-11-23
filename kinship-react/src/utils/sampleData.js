// Sample data for development and demo purposes

export function getSampleListings() {
  return [
    {
      id: 'item1',
      title: 'Canon DSLR Camera',
      description: 'Professional Canon DSLR camera with 18-55mm lens. Perfect for events and photography projects.',
      category: 'electronics',
      pricing: {
        daily: 1500,
        weekly: 8000,
        monthly: 25000
      },
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop'
      ],
      location: 'Mumbai',
      owner: {
        id: 'user1',
        name: 'Rahul Sharma',
        rating: 4.8
      },
      rating: 4.7,
      reviewCount: 23,
      availability: true,
      deposit: 5000
    },
    {
      id: 'item2',
      title: 'Electric Drill Set',
      description: 'Complete drill set with multiple bits and accessories. Ideal for home improvement projects.',
      category: 'tools',
      pricing: {
        daily: 500,
        weekly: 2500,
        monthly: 8000
      },
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'
      ],
      location: 'Delhi',
      owner: {
        id: 'user2',
        name: 'Priya Patel',
        rating: 4.9
      },
      rating: 4.5,
      reviewCount: 15,
      availability: true,
      deposit: 2000
    },
    {
      id: 'item3',
      title: 'Camping Tent (4 Person)',
      description: 'Spacious 4-person tent with waterproof coating. Great for camping trips.',
      category: 'sports',
      pricing: {
        daily: 800,
        weekly: 4000,
        monthly: 12000
      },
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop'
      ],
      location: 'Bangalore',
      owner: {
        id: 'user3',
        name: 'Amit Kumar',
        rating: 4.6
      },
      rating: 4.8,
      reviewCount: 31,
      availability: true,
      deposit: 3000
    },
    {
      id: 'item4',
      title: 'PlayStation 5',
      description: 'Latest PlayStation 5 console with 2 controllers and popular games.',
      category: 'electronics',
      pricing: {
        daily: 2000,
        weekly: 10000,
        monthly: 30000
      },
      images: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop'
      ],
      location: 'Chennai',
      owner: {
        id: 'user4',
        name: 'Sanjay Reddy',
        rating: 4.7
      },
      rating: 4.9,
      reviewCount: 42,
      availability: true,
      deposit: 8000
    },
    {
      id: 'item5',
      title: 'Professional Mixer Grinder',
      description: '750W mixer grinder with multiple jars. Perfect for kitchen use.',
      category: 'home-garden',
      pricing: {
        daily: 300,
        weekly: 1500,
        monthly: 4000
      },
      images: [
        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=300&fit=crop'
      ],
      location: 'Pune',
      owner: {
        id: 'user5',
        name: 'Neha Singh',
        rating: 4.5
      },
      rating: 4.3,
      reviewCount: 18,
      availability: true,
      deposit: 1000
    },
    {
      id: 'item6',
      title: 'Mountain Bike',
      description: '21-speed mountain bike in excellent condition. Suitable for all terrains.',
      category: 'sports',
      pricing: {
        daily: 600,
        weekly: 3000,
        monthly: 9000
      },
      images: [
        'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400&h=300&fit=crop'
      ],
      location: 'Hyderabad',
      owner: {
        id: 'user6',
        name: 'Vikram Rao',
        rating: 4.8
      },
      rating: 4.6,
      reviewCount: 27,
      availability: true,
      deposit: 2500
    },
    {
      id: 'item7',
      title: 'Party Speaker System',
      description: 'Powerful Bluetooth speaker with LED lights. Perfect for parties and events.',
      category: 'electronics',
      pricing: {
        daily: 1200,
        weekly: 6000,
        monthly: 18000
      },
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop'
      ],
      location: 'Kolkata',
      owner: {
        id: 'user7',
        name: 'Ananya Ghosh',
        rating: 4.7
      },
      rating: 4.8,
      reviewCount: 35,
      availability: true,
      deposit: 4000
    },
    {
      id: 'item8',
      title: 'Projector & Screen',
      description: 'HD projector with 100-inch screen. Great for movie nights and presentations.',
      category: 'electronics',
      pricing: {
        daily: 1800,
        weekly: 9000,
        monthly: 27000
      },
      images: [
        'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop'
      ],
      location: 'Ahmedabad',
      owner: {
        id: 'user8',
        name: 'Karan Mehta',
        rating: 4.9
      },
      rating: 4.7,
      reviewCount: 29,
      availability: true,
      deposit: 6000
    }
  ]
}

export function getSampleUsers() {
  return [
    {
      id: 'demo-user',
      email: 'demo@kinship.com',
      password: hashPassword('demo123'),
      profile: {
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        phone: '+91 98765 43210',
        location: 'Mumbai',
        bio: 'This is a demo account for testing the platform.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        joinedDate: '2024-01-01',
        rating: 4.5,
        reviewCount: 12,
        itemsListed: 5,
        itemsRented: 8
      },
      settings: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        privacy: {
          showEmail: false,
          showPhone: true,
          showLocation: true
        }
      }
    }
  ]
}

function hashPassword(password) {
  // Simple hash for demo purposes
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}
