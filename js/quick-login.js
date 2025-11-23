/**
 * Quick login helper for testing
 */

// Quick login function
function quickLogin() {
    const testUser = {
        id: 'user_' + Date.now(),
        email: 'test@example.com',
        password: 'hashedpassword', // In real app, this would be hashed
        profile: {
            name: 'Test User',
            bio: 'Testing the listing feature',
            location: 'Test City',
            joinDate: new Date().toISOString(),
            avatar: '',
            rating: 4.5,
            itemsListed: 0,
            itemsRented: 0,
            verified: true
        },
        settings: {
            notifications: true,
            newsletter: true,
            privacy: 'public'
        },
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('kinship_current_user', JSON.stringify(testUser));
    
    // Also save to users list
    const users = JSON.parse(localStorage.getItem('kinship_users') || '[]');
    const existingIndex = users.findIndex(u => u.email === testUser.email);
    if (existingIndex >= 0) {
        users[existingIndex] = testUser;
    } else {
        users.push(testUser);
    }
    localStorage.setItem('kinship_users', JSON.stringify(users));
    
    console.log('✅ Quick login successful!', testUser);
    
    // Show success message
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
    `;
    toast.textContent = 'Logged in as Test User!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
        // Reload the page to pick up the logged-in state
        window.location.reload();
    }, 2000);
}

// Add quick login button if not logged in
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const currentUser = window.KinshipAuth?.getCurrentUser() || 
                           window.KinshipStorage?.getCurrentUser() ||
                           JSON.parse(localStorage.getItem('kinship_current_user') || 'null');
        
        if (!currentUser) {
            const quickLoginBtn = document.createElement('button');
            quickLoginBtn.textContent = '🚀 Quick Login (Test)';
            quickLoginBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            `;
            quickLoginBtn.onclick = quickLogin;
            document.body.appendChild(quickLoginBtn);
        }
    }, 500);
});
