/**
 * Check authentication system to debug why logged-in users aren't detected
 */

console.log('🔍 Checking Authentication System...\n');

// Check all possible auth sources
console.log('1. Checking window.KinshipAuth:');
console.log('   - Exists:', !!window.KinshipAuth);
if (window.KinshipAuth) {
    console.log('   - getCurrentUser method exists:', !!window.KinshipAuth.getCurrentUser);
    console.log('   - Current user from KinshipAuth:', window.KinshipAuth.getCurrentUser());
}

console.log('\n2. Checking window.KinshipStorage:');
console.log('   - Exists:', !!window.KinshipStorage);
if (window.KinshipStorage) {
    console.log('   - getCurrentUser method exists:', !!window.KinshipStorage.getCurrentUser);
    try {
        const user = window.KinshipStorage.getCurrentUser();
        console.log('   - Current user from KinshipStorage:', user);
    } catch (e) {
        console.error('   - Error getting user:', e);
    }
}

console.log('\n3. Checking localStorage directly:');
const localStorageUser = localStorage.getItem('kinship_current_user');
console.log('   - Raw data:', localStorageUser);
if (localStorageUser) {
    try {
        const parsed = JSON.parse(localStorageUser);
        console.log('   - Parsed user:', parsed);
    } catch (e) {
        console.error('   - Error parsing:', e);
    }
}

console.log('\n4. Checking auth.js loading:');
console.log('   - auth.js loaded:', document.querySelector('script[src*="auth.js"]') !== null);

console.log('\n5. Checking storage.js loading:');
console.log('   - storage.js loaded:', document.querySelector('script[src*="storage.js"]') !== null);

// Check script loading order
console.log('\n6. Script loading order:');
const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src.split('/').pop());
scripts.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script}`);
});

// Try to manually get the current user
function tryGetCurrentUser() {
    // Method 1: KinshipAuth
    if (window.KinshipAuth && window.KinshipAuth.getCurrentUser) {
        const user = window.KinshipAuth.getCurrentUser();
        if (user) return { source: 'KinshipAuth', user };
    }
    
    // Method 2: KinshipStorage
    if (window.KinshipStorage && window.KinshipStorage.getCurrentUser) {
        const user = window.KinshipStorage.getCurrentUser();
        if (user) return { source: 'KinshipStorage', user };
    }
    
    // Method 3: Direct localStorage
    const storedUser = localStorage.getItem('kinship_current_user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            return { source: 'localStorage', user };
        } catch (e) {
            console.error('Failed to parse stored user:', e);
        }
    }
    
    return null;
}

console.log('\n7. Attempting to get current user:');
const result = tryGetCurrentUser();
if (result) {
    console.log('   ✅ User found via:', result.source);
    console.log('   - User:', result.user);
} else {
    console.log('   ❌ No user found');
}

// Export for use in other scripts
window.debugAuth = {
    tryGetCurrentUser,
    checkAll: function() {
        console.clear();
        console.log('🔍 Re-checking Authentication System...\n');
        const result = tryGetCurrentUser();
        if (result) {
            console.log('✅ User is logged in:', result.user);
            console.log('Found via:', result.source);
        } else {
            console.log('❌ No user logged in');
        }
        return result;
    }
};
