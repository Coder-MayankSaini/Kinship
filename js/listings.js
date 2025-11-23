/**
 * Listing Management Module for Kinship Rental Platform
 * Handles creation and management of rental item listings
 */

class ListingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.uploadedImages = [];
        this.availabilityDates = [];

        this.initializeListingForm();
    }

    // Initialize the listing form
    initializeListingForm() {
        // Check if we're on the list-item page
        if (!document.getElementById('listing-form')) {
            return;
        }

        console.log('Initializing listing form...');
        console.log('KinshipAuth available:', !!window.KinshipAuth);

        // Set up the form regardless of authentication status for debugging
        this.setupEventListeners();
        this.updateProgressIndicator();
        this.initializeImageUpload();
        this.initializeAvailabilityCalendar();

        // Check authentication but don't block the form setup
        if (!window.KinshipAuth) {
            console.warn('KinshipAuth not available');
            return;
        }

        if (!window.KinshipAuth.isAuthenticated()) {
            console.warn('User not authenticated');
            // Don't redirect immediately, let them try to submit and handle it there
            return;
        }

        console.log('User is authenticated, form ready');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form navigation buttons
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-listing');

        console.log('Setting up event listeners...');
        console.log('Next button found:', !!nextBtn);
        console.log('Previous button found:', !!prevBtn);
        console.log('Submit button found:', !!submitBtn);

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('Next button clicked');
                this.nextStep();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('Previous button clicked');
                this.prevStep();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                console.log('Submit button clicked');
                this.submitListing(e);
            });
            console.log('Submit button event listener attached');
        } else {
            console.error('Submit button not found! Cannot attach event listener.');
        }

        // Form validation on input
        const form = document.getElementById('listing-form');
        if (form) {
            form.addEventListener('input', (e) => this.handleFormInput(e));
            form.addEventListener('change', (e) => this.handleFormChange(e));

            // Also handle form submission
            form.addEventListener('submit', (e) => {
                console.log('Form submitted');
                e.preventDefault();
                this.submitListing(e);
            });
        }

        // Availability type radio buttons
        const availabilityRadios = document.querySelectorAll('input[name="availability-type"]');
        availabilityRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleAvailabilityTypeChange());
        });

        // Add a global click handler for debugging
        document.addEventListener('click', (e) => {
            if (e.target.id === 'submit-listing') {
                console.log('Submit button clicked via global handler');
            }
        });
    }

    // Handle form input events
    handleFormInput(event) {
        const field = event.target;
        this.validateField(field);
        this.updateFormData(field.name, field.value);
    }

    // Handle form change events
    handleFormChange(event) {
        const field = event.target;
        this.updateFormData(field.name, field.value);
    }

    // Update form data object
    updateFormData(fieldName, value) {
        if (fieldName) {
            this.formData[fieldName] = value;
        }
    }

    // Validate individual field
    validateField(field) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.error');

        // Remove existing error
        if (errorElement) {
            errorElement.remove();
        }
        formGroup.classList.remove('has-error');

        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Specific field validations
        switch (field.name) {
            case 'title':
                if (field.value.trim().length < 5) {
                    isValid = false;
                    errorMessage = 'Title must be at least 5 characters';
                }
                break;

            case 'description':
                if (field.value.trim().length < 20) {
                    isValid = false;
                    errorMessage = 'Description must be at least 20 characters';
                }
                break;

            case 'dailyPrice':
                const price = parseFloat(field.value);
                if (isNaN(price) || price <= 0) {
                    isValid = false;
                    errorMessage = 'Please enter a valid price';
                } else if (price > 10000) {
                    isValid = false;
                    errorMessage = 'Price cannot exceed ₹10,000';
                }
                break;

            case 'weeklyPrice':
                if (field.value) {
                    const weeklyPrice = parseFloat(field.value);
                    const dailyPrice = parseFloat(document.getElementById('daily-price').value);
                    if (isNaN(weeklyPrice) || weeklyPrice <= 0) {
                        isValid = false;
                        errorMessage = 'Please enter a valid weekly price';
                    } else if (weeklyPrice >= dailyPrice * 7) {
                        isValid = false;
                        errorMessage = 'Weekly price should be less than 7x daily price';
                    }
                }
                break;
        }

        // Show error if validation failed
        if (!isValid) {
            formGroup.classList.add('has-error');
            const error = document.createElement('div');
            error.className = 'error';
            error.textContent = errorMessage;
            formGroup.appendChild(error);
        }

        return isValid;
    }

    // Validate current step
    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return false;

        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Step-specific validations
        switch (this.currentStep) {
            case 2: // Photos step
                if (this.uploadedImages.length === 0) {
                    if (window.KinshipUtils && window.KinshipUtils.showToast) {
                        window.KinshipUtils.showToast('Please upload at least one photo', 'error');
                    } else {
                        alert('Please upload at least one photo');
                    }
                    isValid = false;
                }
                break;

            case 3: // Pricing step
                const dailyPrice = document.getElementById('daily-price').value;
                if (!dailyPrice || parseFloat(dailyPrice) <= 0) {
                    if (window.KinshipUtils && window.KinshipUtils.showToast) {
                        window.KinshipUtils.showToast('Please set a valid daily price', 'error');
                    } else {
                        alert('Please set a valid daily price');
                    }
                    isValid = false;
                }
                break;

            case 5: // Review step - check terms agreement
                const termsCheckbox = document.getElementById('terms-agreement');
                if (!termsCheckbox || !termsCheckbox.checked) {
                    if (window.KinshipUtils && window.KinshipUtils.showToast) {
                        window.KinshipUtils.showToast('Please agree to the Terms of Service and Community Guidelines', 'error');
                    } else {
                        alert('Please agree to the Terms of Service and Community Guidelines');
                    }
                    isValid = false;
                }
                break;
        }

        return isValid;
    }

    // Move to next step
    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateProgressIndicator();

            // Generate preview on last step
            if (this.currentStep === this.totalSteps) {
                this.generatePreview();
            }
        }
    }

    // Move to previous step
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateProgressIndicator();
        }
    }

    // Update step display
    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const submitBtn = document.getElementById('submit-listing');

        console.log('Updating step display. Current step:', this.currentStep);
        console.log('Submit button found:', !!submitBtn);
        console.log('Next button found:', !!nextBtn);

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }

        if (this.currentStep === this.totalSteps) {
            // On final step, hide next button and show submit button
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                console.log('Submit button should now be visible');
            }
        } else {
            // On other steps, show next button and hide submit button
            if (nextBtn) {
                nextBtn.style.display = 'inline-block';
            }
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
        }

        // Scroll to top of form
        const formContainer = document.querySelector('.listing-form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Update progress indicator
    updateProgressIndicator() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    // Initialize image upload functionality
    initializeImageUpload() {
        const uploadArea = document.getElementById('photo-upload');
        const fileInput = document.getElementById('photo-input');
        const uploadedPhotosContainer = document.getElementById('uploaded-photos');

        if (!uploadArea || !fileInput) {
            console.error('Required elements not found:', {
                uploadArea: !!uploadArea,
                fileInput: !!fileInput
            });
            return;
        }

        console.log('Initializing image upload...');
        console.log('Upload area found:', uploadArea);
        console.log('File input found:', fileInput);

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            this.handleFileSelection(files);
        });

        // File input change - FIXED: Reset input after processing
        fileInput.addEventListener('change', (e) => {
            console.log('File input changed, files:', e.target.files.length);
            const files = Array.from(e.target.files);
            this.handleFileSelection(files);

            // Reset the file input to allow selecting the same file again
            e.target.value = '';
        });

        // Click to upload - ENHANCED: Better click handling
        const dropzone = uploadArea.querySelector('.upload-dropzone');
        let browseBtn = uploadArea.querySelector('.browse-btn');

        // Fallback search if not found in upload area
        if (!browseBtn) {
            browseBtn = document.querySelector('.browse-btn');
        }

        console.log('Elements found:', {
            dropzone: !!dropzone,
            browseBtn: !!browseBtn,
            dropzoneClass: dropzone?.className,
            browseBtnClass: browseBtn?.className
        });

        if (dropzone) {
            dropzone.addEventListener('click', (e) => {
                // Don't trigger if clicking the browse button specifically
                if (e.target.classList.contains('browse-btn')) {
                    return;
                }
                e.preventDefault();
                console.log('Dropzone clicked');
                fileInput.click();
            });
        }

        if (browseBtn) {
            browseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Browse button clicked - triggering file input');
                fileInput.click();
            });
            console.log('Browse button event listener attached successfully');
        } else {
            console.error('Browse button not found! Looking for .browse-btn');
            // Log all buttons in the upload area for debugging
            const allButtons = uploadArea.querySelectorAll('button');
            console.log('All buttons in upload area:', Array.from(allButtons).map(btn => ({
                className: btn.className,
                text: btn.textContent,
                onclick: btn.onclick
            })));
        }
    }

    // Handle file selection
    handleFileSelection(files) {
        const validFiles = files.filter(file => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                window.KinshipUtils.showToast(`${file.name} is not a valid image file`, 'error');
                return false;
            }

            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                window.KinshipUtils.showToast(`${file.name} is too large. Maximum size is 5MB`, 'error');
                return false;
            }

            return true;
        });

        // Check total image limit
        if (this.uploadedImages.length + validFiles.length > 10) {
            window.KinshipUtils.showToast('Maximum 10 images allowed', 'error');
            return;
        }

        // Process valid files
        validFiles.forEach(file => {
            this.processImageFile(file);
        });
    }

    // Process individual image file
    processImageFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = {
                id: window.KinshipUtils.generateId(),
                name: file.name,
                size: file.size,
                dataUrl: e.target.result
            };

            this.uploadedImages.push(imageData);
            this.displayUploadedImage(imageData);
        };

        reader.readAsDataURL(file);
    }

    // Display uploaded image
    displayUploadedImage(imageData) {
        const container = document.getElementById('uploaded-photos');
        if (!container) return;

        console.log('Displaying uploaded image:', imageData.name);

        const imageElement = document.createElement('div');
        imageElement.className = 'uploaded-photo';
        imageElement.dataset.imageId = imageData.id;

        imageElement.innerHTML = `
            <div class="photo-preview">
                <img src="${imageData.dataUrl}" alt="${imageData.name}">
                <div class="photo-overlay">
                    <div class="photo-actions">
                        <button type="button" class="btn-icon remove-btn" onclick="window.KinshipListings.removeImage('${imageData.id}')" title="Remove">
                            ✕
                        </button>
                        <button type="button" class="btn-icon star-btn" onclick="window.KinshipListings.setMainImage('${imageData.id}')" title="Set as main">
                            ⭐
                        </button>
                    </div>
                </div>
            </div>
            <div class="photo-info">
                <span class="photo-name">${imageData.name}</span>
                <span class="photo-size">${this.formatFileSize(imageData.size)}</span>
            </div>
        `;

        container.appendChild(imageElement);
        console.log('Image element added to container');

        // Set first image as main image
        if (this.uploadedImages.length === 1) {
            this.setMainImage(imageData.id);
        }

        // Show the uploaded photos container
        container.style.display = 'grid';
    }

    // Helper function to format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Remove uploaded image
    removeImage(imageId) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== imageId);

        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageElement) {
            imageElement.remove();
        }

        // Set new main image if removed image was main
        const mainImage = this.uploadedImages.find(img => img.isMain);
        if (!mainImage && this.uploadedImages.length > 0) {
            this.setMainImage(this.uploadedImages[0].id);
        }
    }

    // Set main image
    setMainImage(imageId) {
        // Remove main flag from all images
        this.uploadedImages.forEach(img => {
            img.isMain = false;
        });

        // Set new main image
        const image = this.uploadedImages.find(img => img.id === imageId);
        if (image) {
            image.isMain = true;
        }

        // Update UI
        document.querySelectorAll('.uploaded-photo').forEach(element => {
            element.classList.remove('main-photo');
        });

        const mainElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (mainElement) {
            mainElement.classList.add('main-photo');
        }
    }

    // Initialize availability calendar
    initializeAvailabilityCalendar() {
        // This is a simplified calendar implementation
        // In a real app, you might use a library like FullCalendar
        this.renderAvailabilityCalendar();
    }

    // Handle availability type change
    handleAvailabilityTypeChange() {
        const availabilityType = document.querySelector('input[name="availability-type"]:checked').value;
        const calendar = document.getElementById('availability-calendar');

        if (calendar) {
            calendar.style.display = availabilityType === 'specific' ? 'block' : 'none';
        }
    }

    // Render availability calendar (simplified)
    renderAvailabilityCalendar() {
        const calendar = document.getElementById('availability-calendar');
        if (!calendar) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        calendar.innerHTML = `
            <div class="calendar-header">
                <h4>${this.getMonthName(currentMonth)} ${currentYear}</h4>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
                ${this.generateCalendarDays(currentYear, currentMonth)}
            </div>
            <div class="calendar-legend">
                <span class="legend-item"><span class="legend-color available"></span> Available</span>
                <span class="legend-item"><span class="legend-color unavailable"></span> Unavailable</span>
            </div>
        `;
    }

    // Generate calendar days
    generateCalendarDays(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        let daysHTML = '';

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const isPast = date < today;
            const isSelected = this.availabilityDates.includes(dateString);

            daysHTML += `
                <div class="calendar-day ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''}" 
                     data-date="${dateString}" 
                     ${!isPast ? `onclick="KinshipListings.toggleAvailabilityDate('${dateString}')"` : ''}>
                    ${day}
                </div>
            `;
        }

        return daysHTML;
    }

    // Toggle availability date
    toggleAvailabilityDate(dateString) {
        const index = this.availabilityDates.indexOf(dateString);

        if (index > -1) {
            this.availabilityDates.splice(index, 1);
        } else {
            this.availabilityDates.push(dateString);
        }

        // Update calendar display
        const dayElement = document.querySelector(`[data-date="${dateString}"]`);
        if (dayElement) {
            dayElement.classList.toggle('selected');
        }
    }

    // Get month name
    getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }

    // Generate listing preview
    generatePreview() {
        const previewContainer = document.getElementById('listing-preview');
        if (!previewContainer) return;

        const form = document.getElementById('listing-form');
        const formData = new FormData(form);

        const title = formData.get('title') || 'Untitled Item';
        const category = formData.get('category') || 'Other';
        const description = formData.get('description') || 'No description provided';
        const location = formData.get('location') || 'Location not specified';
        const dailyPrice = formData.get('dailyPrice') || '0';
        const weeklyPrice = formData.get('weeklyPrice') || '';
        const securityDeposit = formData.get('securityDeposit') || '0';
        const minRental = formData.get('minRental') || '1';
        const maxRental = formData.get('maxRental') || '7';

        const mainImage = this.uploadedImages.find(img => img.isMain) || this.uploadedImages[0];

        previewContainer.innerHTML = `
            <div class="listing-preview-card">
                <div class="preview-image">
                    ${mainImage ?
                `<img src="${mainImage.dataUrl}" alt="${title}">` :
                '<div class="no-image">No image uploaded</div>'
            }
                    <div class="image-count">${this.uploadedImages.length} photo${this.uploadedImages.length !== 1 ? 's' : ''}</div>
                </div>
                
                <div class="preview-content">
                    <div class="preview-header">
                        <h3>${title}</h3>
                        <span class="category-badge">${category}</span>
                    </div>
                    
                    <p class="preview-description">${description}</p>
                    
                    <div class="preview-details">
                        <div class="detail-item">
                            <strong>Location:</strong> ${location}
                        </div>
                        <div class="detail-item">
                            <strong>Daily Rate:</strong> ${window.KinshipUtils.formatCurrency(dailyPrice)}
                        </div>
                        ${weeklyPrice ? `
                            <div class="detail-item">
                                <strong>Weekly Rate:</strong> ${window.KinshipUtils.formatCurrency(weeklyPrice)}
                            </div>
                        ` : ''}
                        ${securityDeposit > 0 ? `
                            <div class="detail-item">
                                <strong>Security Deposit:</strong> ${window.KinshipUtils.formatCurrency(securityDeposit)}
                            </div>
                        ` : ''}
                        <div class="detail-item">
                            <strong>Rental Period:</strong> ${minRental} - ${maxRental === '0' ? 'unlimited' : maxRental} days
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Submit listing
    async submitListing(event) {
        event.preventDefault();

        console.log('Submit listing clicked');

        // Check terms agreement first
        const termsCheckbox = document.getElementById('terms-agreement');
        if (!termsCheckbox || !termsCheckbox.checked) {
            const message = 'Please agree to the Terms of Service and Community Guidelines';
            if (window.KinshipUtils?.showToast) {
                window.KinshipUtils.showToast(message, 'error');
            } else {
                alert(message);
            }
            return;
        }

        console.log('Terms agreement checked');

        // Final validation
        if (!this.validateCurrentStep()) {
            console.log('Validation failed');
            return;
        }

        console.log('Validation passed');

        const submitBtn = document.getElementById('submit-listing');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Publishing...';

        try {
            // Check authentication at submission time
            if (!window.KinshipAuth) {
                console.error('KinshipAuth not available');
                // Redirect to auth page if auth service not available
                window.location.href = 'auth.html?return=' + encodeURIComponent(window.location.pathname);
                return;
            }

            if (!window.KinshipAuth.isAuthenticated()) {
                console.error('User not authenticated');
                // Redirect to auth page
                window.location.href = 'auth.html?return=' + encodeURIComponent(window.location.pathname);
                return;
            }

            const currentUser = window.KinshipAuth.getCurrentUser();
            if (!currentUser) {
                console.error('Could not get current user');
                throw new Error('User not authenticated');
            }

            console.log('Current user:', currentUser);            // Collect form data
            const form = document.getElementById('listing-form');
            const formData = new FormData(form);

            console.log('Form data collected');

            // Create item object
            const itemData = {
                id: window.KinshipUtils?.generateId ? window.KinshipUtils.generateId() : 'item_' + Date.now(),
                ownerId: currentUser.id,
                title: formData.get('title'),
                category: formData.get('category'),
                description: formData.get('description'),
                location: formData.get('location'),
                images: this.uploadedImages.map(img => img.dataUrl),
                pricing: {
                    daily: parseFloat(formData.get('dailyPrice')),
                    weekly: formData.get('weeklyPrice') ? parseFloat(formData.get('weeklyPrice')) : null,
                    securityDeposit: formData.get('securityDeposit') ? parseFloat(formData.get('securityDeposit')) : 0
                },
                availability: {
                    type: formData.get('availability-type') || 'always',
                    dates: this.availabilityDates,
                    minRental: parseInt(formData.get('minRental')) || 1,
                    maxRental: parseInt(formData.get('maxRental')) || 7
                },
                rating: 0,
                reviews: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active'
            };

            console.log('Item data created:', itemData);

            // Basic validation (skip advanced validation if not available)
            if (!itemData.title || !itemData.category || !itemData.pricing.daily) {
                throw new Error('Please fill in all required fields');
            }

            // Validate item data if validation service is available
            if (window.KinshipValidation && window.KinshipValidation.validateItemData) {
                if (!window.KinshipValidation.validateItemData(itemData)) {
                    throw new Error('Invalid item data');
                }
            }

            console.log('Validation passed');

            // Save to storage
            if (!window.KinshipStorage || !window.KinshipStorage.saveItem) {
                throw new Error('Storage service not available');
            }

            const saved = window.KinshipStorage.saveItem(itemData);
            console.log('Save result:', saved);

            if (saved) {
                if (window.KinshipUtils && window.KinshipUtils.showToast) {
                    window.KinshipUtils.showToast('Listing published successfully!', 'success');
                } else {
                    alert('Listing published successfully!');
                }

                // Redirect to item detail page or profile
                setTimeout(() => {
                    window.location.href = `item-detail.html?id=${itemData.id}`;
                }, 1500);
            } else {
                throw new Error('Failed to save listing');
            }

        } catch (error) {
            console.error('Error submitting listing:', error);

            if (window.KinshipUtils && window.KinshipUtils.showToast) {
                window.KinshipUtils.showToast(`Error publishing listing: ${error.message}`, 'error');
            } else {
                alert(`Error publishing listing: ${error.message}`);
            }
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// Initialize listing manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing listing manager...');
    window.KinshipListings = new ListingManager();
});

// Backup initialization after a delay
setTimeout(() => {
    if (!window.KinshipListings && document.getElementById('listing-form')) {
        console.log('Backup initialization - creating listing manager...');
        window.KinshipListings = new ListingManager();
    }
}, 1000);

// Make sure the listing manager is available globally for debugging
window.initializeListings = function () {
    console.log('Manual initialization called');
    window.KinshipListings = new ListingManager();
};

console.log('Listings module loaded');