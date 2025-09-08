/**
 * Login Status Indicator for List Item Page
 */

// Function to check storage usage
function getStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            totalSize += new Blob([value]).size;
        }
    }
    return totalSize;
}

document.addEventListener('DOMContentLoaded', () => {
    // DISABLED: Login status indicator and storage warning
    // These UI elements have been disabled per user request
    // To re-enable, uncomment the code below
    return;
    
    /*
    // Create login status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'login-status-indicator';
    statusIndicator.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
    `;

    // Check login status
    function checkLoginStatus() {
        const currentUser = window.KinshipAuthHelper?.getCurrentUser() || 
                          window.KinshipAuth?.getCurrentUser() || 
                          window.KinshipStorage?.getCurrentUser();

        if (currentUser) {
            statusIndicator.innerHTML = `
                <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%;"></div>
                <span>Logged in as <strong>${currentUser.profile?.name || currentUser.email}</strong></span>
            `;
            statusIndicator.style.borderLeft = '4px solid #10b981';
        } else {
            statusIndicator.innerHTML = `
                <div style="width: 10px; height: 10px; background: #ef4444; border-radius: 50%;"></div>
                <span>Not logged in</span>
                <button onclick="window.location.href='auth.html'" style="
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 5px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-left: 10px;
                ">Login</button>
                <button onclick="quickTestLogin()" style="
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 5px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                ">Quick Test Login</button>
            `;
            statusIndicator.style.borderLeft = '4px solid #ef4444';
        }
    }

    // Quick test login function
    window.quickTestLogin = function() {
        const testUser = {
            id: 'test-' + Date.now(),
            email: 'test@example.com',
            profile: {
                name: 'Test User',
                phone: '1234567890',
                location: 'Test City',
                bio: 'Test user for listing creation'
            },
            createdAt: new Date().toISOString()
        };

        // Set user in all possible locations
        localStorage.setItem('kinship_current_user', JSON.stringify(testUser));
        
        if (window.KinshipAuthHelper) {
            window.KinshipAuthHelper.setCurrentUser(testUser);
        }
        if (window.KinshipAuth) {
            window.KinshipAuth.currentUser = testUser;
        }
        if (window.KinshipStorage) {
            window.KinshipStorage.saveUser(testUser);
            window.KinshipStorage.setCurrentUser(testUser.id);
        }

        // Show success message
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 10000;
        `;
        toast.textContent = 'Test login successful!';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
            checkLoginStatus();
        }, 2000);
    };

    // Add to page
    document.body.appendChild(statusIndicator);
    checkLoginStatus();
    
    // Check storage usage and show warning if needed
    const storageSize = getStorageUsage();
    const storageMB = (storageSize / 1024 / 1024).toFixed(2);
    
    if (storageMB > 4) { // Warning at 4MB (localStorage limit is usually 5-10MB)
        const storageWarning = document.createElement('div');
        storageWarning.style.cssText = `
            position: fixed;
            top: 140px;
            right: 20px;
            background: #fff3cd;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 100;
            border-left: 4px solid #ffc107;
            max-width: 300px;
        `;
        storageWarning.innerHTML = `
            <strong>⚠️ Storage Nearly Full</strong><br>
            <small>Using ${storageMB} MB of storage</small><br>
            <a href="fix-storage-quota.html" style="
                display: inline-block;
                margin-top: 8px;
                color: #0066cc;
                text-decoration: none;
                font-weight: 500;
            ">Clean up storage →</a>
        `;
        document.body.appendChild(storageWarning);
    }

    // Update status when auth changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'kinship_current_user') {
            checkLoginStatus();
        }
    });
});
