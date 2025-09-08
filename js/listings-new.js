/**
 * Redesigned Listing Management Module
 * Clean, robust, and user-friendly implementation
 */

class NewListingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.uploadedImages = [];
        this.isSubmitting = false;

        this.init();
    }

    init() {
        if (!document.getElementById('listing-form')) {
            return;
        }

        console.log('🚀 Initializing redesigned listing form...');

        this.setupEventListeners();
        this.initializeImageUpload();
        this.updateStepDisplay();
    }

    setupEventListeners() {
        // Navigation buttons
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-listing');
        const form = document.getElementById('listing-form');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
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

        // Form validation
        this.setupFormValidation();

        // Terms checkbox
        const termsCheckbox = document.getElementById('terms-agreement');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
                this.updateSubmitButton();
            });
        }
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Specific validations
        switch (fieldName) {
            case 'title':
                if (value && value.length < 5) {
                    isValid = false;
                    errorMessage = 'Title must be at least 5 characters long';
                }
                break;
            case 'description':
                if (value && value.length < 20) {
                    isValid = false;
                    errorMessage = 'Description must be at least 20 characters long';
                }
                break;
            case 'dailyRate':
                if (value && (isNaN(value) || parseFloat(value) < 1)) {
                    isValid = false;
                    errorMessage = 'Daily rate must be at least ₹1';
                }
                break;
        }

        if (!isValid) {
            this.showError(field, errorMessage);
        }

        return isValid;
    }

    showError(field, message) {
        const errorElement = document.getElementById(field.name + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        field.style.borderColor = '#dc3545';
    }

    clearError(field) {
        const errorElement = document.getElementById(field.name + '-error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        field.style.borderColor = '';
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('input[required], textarea[required], select[required]');

        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Step-specific validation
        if (this.currentStep === 2) {
            if (this.uploadedImages.length < 1) {
                this.showToast('Please upload at least 1 photo', 'error');
                isValid = false;
            }
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
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
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
            prevBtn.style.display = this.currentStep > 1 ? 'inline-flex' : 'none';
        }

        // Next button
        if (nextBtn) {
            nextBtn.style.display = this.currentStep < this.totalSteps ? 'inline-flex' : 'none';
        }

        // Submit button
        if (submitBtn) {
            submitBtn.style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';
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
        const uploadBtn = document.querySelector('.browse-btn');

        if (!dropzone || !fileInput) {
            console.warn('Photo upload elements not found');
            return;
        }

        // Click to upload
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });

        uploadBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileUpload(files);
            e.target.value = ''; // Reset for re-upload
        });

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(files);
        });
    }

    handleFileUpload(files) {
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
        };

        reader.onerror = () => {
            this.showToast(`Failed to read ${file.name}`, 'error');
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
                <button type="button" class="photo-btn delete" onclick="listingManager.removeImage('${imageData.id}')" title="Remove">
                    ×
                </button>
            </div>
        `;

        container.appendChild(imageElement);

        // Show the container if it was hidden
        container.style.display = 'grid';
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
        }

        this.showToast('Image removed', 'info');
    }

    collectFormData() {
        const formData = new FormData();
        const form = document.getElementById('listing-form');

        // Collect all form inputs
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'file' && input.name) {
                formData.append(input.name, input.value);
            }
        });

        // Add images
        this.uploadedImages.forEach((image, index) => {
            if (image.file) {
                formData.append(`images[${index}]`, image.file);
            }
        });

        // Add metadata
        formData.append('timestamp', new Date().toISOString());
        formData.append('imageCount', this.uploadedImages.length);

        return formData;
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
        const dailyRate = formData.get('dailyRate') || '0';
        const weeklyRate = formData.get('weeklyRate') || 'Not set';
        const securityDeposit = formData.get('securityDeposit') || '0';
        const condition = formData.get('condition') || 'Not specified';

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
                <p>Daily: ₹${dailyRate} | Weekly: ${weeklyRate !== 'Not set' ? '₹' + weeklyRate : weeklyRate} | Deposit: ₹${securityDeposit}</p>
            </div>
            <div class="preview-section">
                <h4>Condition</h4>
                <p>${this.getConditionLabel(condition)}</p>
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

    getConditionLabel(value) {
        const conditions = {
            'excellent': 'Excellent - Like new',
            'very-good': 'Very Good - Minor signs of use',
            'good': 'Good - Normal wear and tear',
            'fair': 'Fair - Shows wear but functional'
        };
        return conditions[value] || value;
    }

    async submitListing() {
        if (this.isSubmitting) return;

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
        this.showLoading(true);
        this.updateSubmitButton();

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Collect form data
            const formData = this.collectFormData();

            // Store in localStorage (simulate saving)
            const listingData = {};
            for (let [key, value] of formData.entries()) {
                if (!key.startsWith('images[')) {
                    listingData[key] = value;
                }
            }

            listingData.images = this.uploadedImages.map(img => ({
                id: img.id,
                name: img.name,
                dataUrl: img.dataUrl
            }));

            // Save to localStorage
            const existingListings = JSON.parse(localStorage.getItem('userListings') || '[]');
            listingData.id = Date.now();
            listingData.status = 'active';
            listingData.createdAt = new Date().toISOString();
            existingListings.push(listingData);
            localStorage.setItem('userListings', JSON.stringify(existingListings));

            console.log('✅ Listing submitted successfully:', listingData);

            this.showLoading(false);
            this.showSuccessModal();

        } catch (error) {
            console.error('❌ Error submitting listing:', error);
            this.showLoading(false);
            this.showToast('Failed to submit listing. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
            this.updateSubmitButton();
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('show', show);
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.add('show');

            // Auto-close after 5 seconds
            setTimeout(() => {
                modal.classList.remove('show');
                window.location.href = 'profile.html';
            }, 5000);
        }
    }

    showToast(message, type = 'info') {
        // Create toast if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #333;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(toast);
        }

        // Set colors based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        toast.style.background = colors[type] || colors.info;
        toast.textContent = message;

        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Hide toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
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
    window.listingManager = new NewListingManager();
});

// Global reference for onclick handlers
window.NewListingManager = NewListingManager;
