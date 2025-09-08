/**
 * Debug script for listing submission issues
 */

// Check if user is logged in
function checkUserStatus() {
    const currentUser = window.KinshipAuth?.getCurrentUser() || 
                       window.KinshipStorage?.getCurrentUser();
    
    if (!currentUser) {
        console.error('❌ No user logged in! Please log in first.');
        // Try to get user from localStorage directly
        const storedUser = localStorage.getItem('kinship_current_user');
        console.log('Stored user data:', storedUser);
        
        // Show login prompt
        const loginPrompt = document.createElement('div');
        loginPrompt.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            text-align: center;
        `;
        loginPrompt.innerHTML = `
            <h2 style="margin-bottom: 1rem;">Please Log In First</h2>
            <p style="margin-bottom: 1.5rem;">You need to be logged in to list items.</p>
            <button onclick="window.location.href='auth.html'" style="
                background: #d4a751;
                color: #2d1b0e;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 16px;
            ">Go to Login Page</button>
            <button onclick="this.parentElement.remove()" style="
                background: #6b7280;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 16px;
                margin-left: 1rem;
            ">Cancel</button>
        `;
        document.body.appendChild(loginPrompt);
        return false;
    }
    
    console.log('✅ User logged in:', currentUser);
    return true;
}

// Check form validation
function checkFormValidation() {
    const form = document.getElementById('listing-form');
    if (!form) {
        console.error('❌ Listing form not found!');
        return false;
    }
    
    // Check each step's required fields
    const steps = [
        {
            step: 1,
            fields: ['title', 'category', 'description', 'location']
        },
        {
            step: 3,
            fields: ['dailyPrice']
        }
    ];
    
    let allValid = true;
    steps.forEach(stepInfo => {
        stepInfo.fields.forEach(fieldName => {
            const field = form.elements[fieldName];
            if (!field) {
                console.error(`❌ Field '${fieldName}' not found in form`);
                allValid = false;
            } else if (!field.value.trim()) {
                console.error(`❌ Field '${fieldName}' is empty`);
                allValid = false;
            } else {
                console.log(`✅ Field '${fieldName}': ${field.value}`);
            }
        });
    });
    
    return allValid;
}

// Check uploaded images
function checkUploadedImages() {
    if (!window.kinshipListings) {
        console.error('❌ KinshipListings not initialized');
        return false;
    }
    
    const uploadedImages = window.kinshipListings.uploadedImages;
    if (!uploadedImages || uploadedImages.length === 0) {
        console.error('❌ No images uploaded');
        return false;
    }
    
    console.log(`✅ ${uploadedImages.length} images uploaded`);
    return true;
}

// Check terms agreement
function checkTermsAgreement() {
    const termsCheckbox = document.getElementById('terms-agreement');
    if (!termsCheckbox) {
        console.error('❌ Terms checkbox not found');
        return false;
    }
    
    if (!termsCheckbox.checked) {
        console.error('❌ Terms not agreed to');
        return false;
    }
    
    console.log('✅ Terms agreed');
    return true;
}

// Run all checks
function runDebugChecks() {
    console.log('🔍 Starting listing submission debug...\n');
    
    const checks = {
        'User Login': checkUserStatus(),
        'Form Validation': checkFormValidation(),
        'Image Upload': checkUploadedImages(),
        'Terms Agreement': checkTermsAgreement()
    };
    
    console.log('\n📊 Debug Summary:');
    Object.entries(checks).forEach(([checkName, result]) => {
        console.log(`${result ? '✅' : '❌'} ${checkName}`);
    });
    
    const allPassed = Object.values(checks).every(v => v === true);
    if (allPassed) {
        console.log('\n✨ All checks passed! The form should submit successfully.');
    } else {
        console.log('\n⚠️ Some checks failed. Fix the issues above and try again.');
    }
    
    // Check if availability calendar is loaded
    if (window.availabilityCalendar) {
        console.log('\n📅 Availability Calendar:', window.availabilityCalendar.getAvailabilityData());
    } else {
        console.log('\n⚠️ Availability Calendar not loaded');
    }
}

// Auto-run on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for everything to initialize
    setTimeout(() => {
        console.log('Running debug checks...');
        runDebugChecks();
        
        // Add debug button
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔍 Run Debug Check';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #6b7280;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        debugBtn.onclick = runDebugChecks;
        document.body.appendChild(debugBtn);
    }, 1000);
});

// Export for console use
window.debugListing = {
    checkUserStatus,
    checkFormValidation,
    checkUploadedImages,
    checkTermsAgreement,
    runDebugChecks
};
