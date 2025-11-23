/**
 * Compatible Listing Management for list-item.html
 * Designed to work with the existing HTML structure
 */

class KinshipListings {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedImages = [];
        this.isSubmitting = false;

        this.init();
    }

    init() {
        if (!document.getElementById('listing-form')) {
            return;
        }

        console.log('🚀 Initializing listing form...');
        this.setupEventListeners();
        this.initializeImageUpload();
        this.updateStepDisplay();
    }

    setupEventListeners() {
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-listing');
        const form = document.getElementById('listing-form');

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextStep();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevStep();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitListing();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitListing();
            });
        }

        // Terms checkbox
        const termsCheckbox = document.getElementById('terms-agreement');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
                this.updateSubmitButton();
            });
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('input[required], textarea[required], select[required]');
        
        let isValid = true;

        requiredFields.forEach(field => {
            const value = field.value.trim();
            if (!value) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        // Step 2 specific validation - photos
        if (this.currentStep === 2) {
            if (this.uploadedImages.length === 0) {
                this.showToast('Please upload at least 1 photo', 'error');
                isValid = false;
            }
        }

        if (!isValid) {
            this.showToast('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.scrollToTop();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.scrollToTop();
        }
    }

    updateStepDisplay() {
        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update form steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update navigation buttons
        this.updateNavigationButtons();

        // Update preview if on last step
        if (this.currentStep === this.totalSteps) {
            this.updatePreview();
        }
    }

    updateNavigationButtons() {
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-listing');

        // Previous button
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }

        // Next button
        if (nextBtn) {
            nextBtn.style.display = this.currentStep < this.totalSteps ? 'inline-block' : 'none';
        }

        // Submit button
        if (submitBtn) {
            submitBtn.style.display = this.currentStep === this.totalSteps ? 'inline-block' : 'none';
            this.updateSubmitButton();
        }
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-listing');
        const termsCheckbox = document.getElementById('terms-agreement');

        if (submitBtn && termsCheckbox) {
            submitBtn.disabled = !termsCheckbox.checked || this.isSubmitting;
            submitBtn.style.opacity = submitBtn.disabled ? '0.6' : '1';
        }
    }

    initializeImageUpload() {
        const dropzone = document.querySelector('.upload-dropzone');
        const fileInput = document.getElementById('photo-input');
        const browseBtn = document.querySelector('.browse-btn');

        if (!dropzone || !fileInput) {
            console.warn('Photo upload elements not found');
            return;
        }

        console.log('✅ Photo upload elements found, setting up event listeners...');

        // Click to upload
        dropzone.addEventListener('click', () => {
            console.log('Dropzone clicked, opening file dialog');
            fileInput.click();
        });

        if (browseBtn) {
            browseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Browse button clicked, opening file dialog');
                fileInput.click();
            });
        }

        // File input change
        fileInput.addEventListener('change', (e) => {
            console.log('Files selected:', e.target.files);
            const files = Array.from(e.target.files);
            this.handleFileUpload(files);
            e.target.value = ''; // Reset for re-upload
        });

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#2563eb';
            dropzone.style.backgroundColor = '#f0f7ff';
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#d1d5db';
            dropzone.style.backgroundColor = '#fafafa';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            console.log('Files dropped:', e.dataTransfer.files);
            dropzone.style.borderColor = '#d1d5db';
            dropzone.style.backgroundColor = '#fafafa';
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(files);
        });

        console.log('✅ Image upload initialized successfully');
    }

    handleFileUpload(files) {
        console.log('Processing', files.length, 'files');
        
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                this.showToast(`${file.name} is not a valid image file`, 'error');
                return false;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                this.showToast(`${file.name} is too large (max 5MB)`, 'error');
                return false;
            }

            return true;
        });

        if (validFiles.length === 0) return;

        validFiles.forEach(file => {
            this.processImage(file);
        });
    }

    processImage(file) {
        console.log('Processing image:', file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                dataUrl: e.target.result,
                file: file
            };

            this.uploadedImages.push(imageData);
            this.displayImage(imageData);
            this.showToast(`${file.name} uploaded successfully`, 'success');
            console.log('✅ Image processed successfully:', file.name);
        };

        reader.onerror = () => {
            this.showToast(`Failed to read ${file.name}`, 'error');
            console.error('Failed to read file:', file.name);
        };

        reader.readAsDataURL(file);
    }

    displayImage(imageData) {
        const container = document.getElementById('uploaded-photos');
        if (!container) return;

        const imageElement = document.createElement('div');
        imageElement.className = 'photo-item';
        imageElement.dataset.imageId = imageData.id;

        imageElement.innerHTML = `
            <img src="${imageData.dataUrl}" alt="${imageData.name}">
            <div class="photo-controls">
                <button type="button" class="photo-btn delete" onclick="window.kinshipListings.removeImage('${imageData.id}')" title="Remove">
                    ×
                </button>
            </div>
        `;

        container.appendChild(imageElement);

        // Show the container and add class for styling
        container.style.display = 'grid';
        container.classList.add('has-photos');
    }

    removeImage(imageId) {
        // Remove from array
        this.uploadedImages = this.uploadedImages.filter(img => img.id != imageId);

        // Remove from DOM
        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageElement) {
            imageElement.remove();
        }

        // Hide container if no images
        const container = document.getElementById('uploaded-photos');
        if (container && this.uploadedImages.length === 0) {
            container.style.display = 'none';
            container.classList.remove('has-photos');
        }

        this.showToast('Image removed', 'info');
    }

    updatePreview() {
        const previewContainer = document.getElementById('listing-preview');
        if (!previewContainer) return;

        const form = document.getElementById('listing-form');
        const formData = new FormData(form);

        const title = formData.get('title') || 'No title provided';
        const category = formData.get('category') || 'No category selected';
        const description = formData.get('description') || 'No description provided';
        const location = formData.get('location') || 'No location provided';
        const dailyPrice = formData.get('dailyPrice') || '0';
        const weeklyPrice = formData.get('weeklyPrice') || 'Not set';
        const securityDeposit = formData.get('securityDeposit') || '0';
        const minRental = formData.get('minRental') || '1';
        const maxRental = formData.get('maxRental') || '0';

        // Get availability data
        const availabilityData = window.availabilityCalendar ? 
            window.availabilityCalendar.getAvailabilityData() : 
            { type: 'always', dates: [] };

        previewContainer.innerHTML = `
            <div class="preview-section">
                <h4>Title</h4>
                <p>${title}</p>
            </div>
            <div class="preview-section">
                <h4>Category</h4>
                <p>${this.getCategoryLabel(category)}</p>
            </div>
            <div class="preview-section">
                <h4>Description</h4>
                <p>${description}</p>
            </div>
            <div class="preview-section">
                <h4>Location</h4>
                <p>${location}</p>
            </div>
            <div class="preview-section">
                <h4>Pricing</h4>
                <p>Daily: ₹${dailyPrice} | Weekly: ${weeklyPrice !== 'Not set' ? '₹' + weeklyPrice : weeklyPrice} | Deposit: ₹${securityDeposit}</p>
            </div>
            <div class="preview-section">
                <h4>Availability</h4>
                <p>${availabilityData.type === 'always' ? 'Available anytime' : `Specific dates (${availabilityData.dates.length} selected)`}</p>
                <p>Minimum rental: ${minRental} day${minRental > 1 ? 's' : ''} | Maximum rental: ${maxRental === '0' ? 'No limit' : maxRental + ' days'}</p>
            </div>
            <div class="preview-section">
                <h4>Photos (${this.uploadedImages.length})</h4>
                <div class="preview-photos">
                    ${this.uploadedImages.map(img => `
                        <div class="preview-photo">
                            <img src="${img.dataUrl}" alt="${img.name}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getCategoryLabel(value) {
        const categories = {
            'electronics': 'Electronics',
            'tools': 'Tools & Equipment',
            'sports': 'Sports & Recreation',
            'home-garden': 'Home & Garden',
            'automotive': 'Automotive',
            'clothing': 'Clothing & Accessories',
            'books': 'Books & Media',
            'other': 'Other'
        };
        return categories[value] || value;
    }

    async submitListing() {
        if (this.isSubmitting) return;

        // Check if user is logged in first
        const currentUser = window.KinshipAuthHelper ? 
            window.KinshipAuthHelper.getCurrentUser() : 
            (window.KinshipAuth?.getCurrentUser() || window.KinshipStorage?.getCurrentUser());
        
        if (!currentUser) {
            console.error('User not logged in');
            this.showToast('Please log in to create a listing', 'error');
            setTimeout(() => {
                if (confirm('You need to be logged in to list items. Would you like to log in now?')) {
                    window.location.href = 'auth.html?return=' + encodeURIComponent(window.location.pathname);
                }
            }, 500);
            return;
        }

        // Final validation
        if (!this.validateCurrentStep()) {
            return;
        }

        const termsCheckbox = document.getElementById('terms-agreement');
        if (!termsCheckbox || !termsCheckbox.checked) {
            this.showToast('Please agree to the terms and conditions', 'error');
            return;
        }

        if (this.uploadedImages.length === 0) {
            this.showToast('Please upload at least one photo', 'error');
            return;
        }

        this.isSubmitting = true;
        this.updateSubmitButton();

        try {
            // Show loading state
            const submitBtn = document.getElementById('submit-listing');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Publishing...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Current user was already checked at the beginning of submitListing
            console.log('Listing submission - Current user:', currentUser);

            // Collect form data
            const form = document.getElementById('listing-form');
            const formData = new FormData(form);

            // Get availability data from calendar
            const availabilityData = window.availabilityCalendar ? 
                window.availabilityCalendar.getAvailabilityData() : 
                { type: 'always', dates: [] };

            const listingData = {
                id: Date.now(),
                title: formData.get('title'),
                category: formData.get('category'),
                description: formData.get('description'),
                location: formData.get('location'),
                pricing: {
                    daily: parseFloat(formData.get('dailyPrice')) || 0,
                    weekly: formData.get('weeklyPrice') ? parseFloat(formData.get('weeklyPrice')) : null,
                    deposit: parseFloat(formData.get('securityDeposit')) || 0
                },
                availability: availabilityData,
                minRental: parseInt(formData.get('minRental')) || 1,
                maxRental: parseInt(formData.get('maxRental')) || 0,
                images: this.uploadedImages.map(img => img.dataUrl), // Store as URL array
                status: 'active',
                ownerId: currentUser.id,
                ownerName: currentUser.profile?.name || currentUser.email,
                rating: 0,
                reviewCount: 0,
                views: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Save to both storage locations for compatibility
            try {
                // 1. Save to kinship_items (used by browse/profile pages)
                const existingItems = JSON.parse(localStorage.getItem('kinship_items') || '[]');
                existingItems.push(listingData);
                localStorage.setItem('kinship_items', JSON.stringify(existingItems));
                
                // 2. Also save using the storage manager if available
                if (window.KinshipStorage) {
                    window.KinshipStorage.saveItem(listingData);
                }
            } catch (storageError) {
                if (storageError.name === 'QuotaExceededError' || 
                    storageError.message.includes('exceeded the quota')) {
                    console.error('Storage quota exceeded:', storageError);
                    
                    // Try to save with compressed images
                    const compressedListing = {...listingData};
                    // Keep only first image for storage-limited saves
                    compressedListing.images = listingData.images.slice(0, 1);
                    
                    try {
                        const existingItems = JSON.parse(localStorage.getItem('kinship_items') || '[]');
                        existingItems.push(compressedListing);
                        localStorage.setItem('kinship_items', JSON.stringify(existingItems));
                        
                        this.showToast('Listing saved with limited images due to storage constraints', 'warning');
                    } catch (retryError) {
                        throw new Error('Storage is full. Please clear some old listings first.');
                    }
                } else {
                    throw storageError;
                }
            }

            console.log('✅ Listing submitted successfully:', listingData);

            submitBtn.textContent = originalText;
            this.showToast('Listing published successfully!', 'success');

            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Error submitting listing:', error);
            const errorMessage = error.message || 'Failed to submit listing';
            this.showToast(`Error: ${errorMessage}. Please try again.`, 'error');
            
            const submitBtn = document.getElementById('submit-listing');
            submitBtn.textContent = 'Publish Listing';
        } finally {
            this.isSubmitting = false;
            this.updateSubmitButton();
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.getElementById('toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
            font-weight: 500;
        `;

        // Set colors based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.style.background = colors[type] || colors.info;
        toast.style.color = 'white';
        toast.textContent = message;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Hide toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing KinshipListings...');
    window.kinshipListings = new KinshipListings();
    
    // Also create global reference for backward compatibility
    window.KinshipListings = KinshipListings;
});
