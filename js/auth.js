// Kinship - Authentication System
// Handles user registration, login, and session management

console.log('Auth.js: Script starting to execute...');

// Authentication Manager Class
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializationComplete = false;
        
        // Delay initialization to ensure dependencies are loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeAuth());
        } else {
            // Use setTimeout to ensure storage is available
            setTimeout(() => this.initializeAuth(), 0);
        }
    }

    // Initialize authentication system
    initializeAuth() {
        console.log('AuthManager: Initializing authentication system...');
        this.loadCurrentUser();
        this.setupAuthEventListeners();

        // Mark initialization as complete
        this.initializationComplete = true;

        // Dispatch initialization complete event
        window.dispatchEvent(new CustomEvent('authInitialized', {
            detail: { user: this.currentUser }
        }));

        console.log('AuthManager: Initialization complete');
    }

    // Load current user from storage
    loadCurrentUser() {
        try {
            // Check if KinshipStorage is available
            if (!window.KinshipStorage) {
                console.warn('AuthManager: KinshipStorage not available yet');
                return;
            }
            
            const currentUser = window.KinshipStorage.getCurrentUser();
            console.log('AuthManager: Loading current user:', currentUser ? 'Found' : 'Not found');

            if (currentUser) {
                this.currentUser = currentUser;
                console.log('AuthManager: Current user loaded:', this.currentUser && this.currentUser.profile ? this.currentUser.profile.name : 'Unknown');

                window.KinshipApp = window.KinshipApp || {};
                window.KinshipApp.currentUser = this.currentUser;
                this.updateUIForAuthenticatedUser();
            } else {
                console.log('AuthManager: No current user session found');
            }
        } catch (error) {
            console.error('AuthManager: Error loading current user:', error);
            this.currentUser = null;
        }
    }

    // Setup event listeners for auth forms
    setupAuthEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEventListeners());
        } else {
            this.bindEventListeners();
        }
    }

    bindEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            console.log('Login form listener attached');
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            console.log('Register form listener attached');
        }

        // Tab switching
        const authTabs = document.querySelectorAll('.auth-tabs .tab-btn');
        authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e));
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Social login buttons
        const socialButtons = document.querySelectorAll('.btn-social');
        socialButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Demo login button
        const demoLoginBtn = document.getElementById('demo-login-btn');
        if (demoLoginBtn) {
            demoLoginBtn.addEventListener('click', () => this.handleDemoLogin());
        }

        // Real-time form validation
        this.setupRealTimeValidation();

        // Password reset
        const forgotPasswordLink = document.querySelector('.forgot-link');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => this.showPasswordReset(e));
        }

        // Password reset modal
        const passwordResetModal = document.getElementById('password-reset-modal');
        const passwordResetForm = document.getElementById('password-reset-form');
        const closeModal = document.querySelector('.modal .close');

        if (passwordResetForm) {
            passwordResetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => this.hidePasswordReset());
        }

        if (passwordResetModal) {
            passwordResetModal.addEventListener('click', (e) => {
                if (e.target === passwordResetModal) {
                    this.hidePasswordReset();
                }
            });
        }
    }

    // Handle user registration
    async handleRegister(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Creating Account...';

        try {
            const formData = new FormData(form);

            // Get form values - handle both simple and complex forms
            const userData = {
                name: formData.get('name'),
                firstName: formData.get('firstName') || (formData.get('name') ? formData.get('name').split(' ')[0] : ''),
                lastName: formData.get('lastName') || (formData.get('name') ? formData.get('name').split(' ').slice(1).join(' ') : ''),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword') || formData.get('password'), // Use same password if no confirm field
                phone: formData.get('phone') || '',
                location: formData.get('location') || 'Not specified'
            };

            // Validate form data
            const validation = this.validateRegistrationData(userData);
            if (!validation.isValid) {
                this.showFormErrors(form, validation.errors);
                // Reset button state before returning
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }

            // Check if user already exists
            const existingUser = window.KinshipStorage.getUserByEmail(userData.email);
            if (existingUser) {
                this.showFormErrors(form, { email: 'An account with this email already exists' });
                // Reset button state before returning
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }

            // Create user object
            const newUser = {
                id: window.KinshipUtils.generateId(),
                email: userData.email,
                password: this.hashPassword(userData.password),
                profile: {
                    name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone || '',
                    location: userData.location,
                    avatar: this.generateRandomAvatar(userData.email),
                    rating: 0,
                    joinDate: new Date().toISOString(),
                    bio: ''
                }
            };

            // Save user
            const saved = window.KinshipStorage.saveUser(newUser);
            if (saved) {
                console.log('Registration: User saved successfully, logging in...');

                // Auto-login after registration
                const loginSuccess = this.loginUser(newUser);
                if (loginSuccess) {
                    console.log('Registration: Login successful, showing success message...');
                    
                    // Try to show toast, but don't let it block the redirect
                    try {
                        window.KinshipUtils.showToast('Account created successfully! Welcome to Kinship!', 'success');
                    } catch (toastError) {
                        console.error('Toast error:', toastError);
                    }

                    // Redirect immediately or after short delay
                    console.log('Registration: Redirecting to index.html...');
                    setTimeout(() => {
                        console.log('Registration: Executing redirect now');
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    console.error('Registration: Failed to log in user after registration');
                    try {
                        window.KinshipUtils.showToast('Account created but login failed. Please try logging in manually.', 'warning');
                    } catch (toastError) {
                        console.error('Toast error:', toastError);
                        alert('Account created but login failed. Please try logging in manually.');
                    }
                }
            } else {
                console.error('Registration: Failed to save user');
                try {
                    window.KinshipUtils.showToast('Error creating account. Please try again.', 'error');
                } catch (toastError) {
                    console.error('Toast error:', toastError);
                    alert('Error creating account. Please try again.');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            window.KinshipUtils.showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    // Handle user login
    async handleLogin(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Signing In...';

        try {
            const formData = new FormData(form);

            const email = formData.get('email');
            const password = formData.get('password');

            // Validate input
            if (!email || !password) {
                this.showFormErrors(form, {
                    email: !email ? 'Email is required' : '',
                    password: !password ? 'Password is required' : ''
                });
                // Reset button state before returning
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }

            // Find user
            const user = window.KinshipStorage.getUserByEmail(email);
            console.log('Login: User lookup result:', user ? 'Found' : 'Not found');

            if (!user) {
                console.log('Login: No account found for email:', email);
                this.showFormErrors(form, { email: 'No account found with this email' });
                // Reset button state before returning
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }

            // Verify password
            console.log('Login: Verifying password...');
            if (!this.verifyPassword(password, user.password)) {
                console.log('Login: Password verification failed');
                this.showFormErrors(form, { password: 'Incorrect password' });
                // Reset button state before returning
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }

            console.log('Login: Password verified, logging in user...');
            // Login user
            const loginSuccess = this.loginUser(user);
            if (loginSuccess) {
                // Try to show toast, but don't let it block the redirect
                try {
                    window.KinshipUtils.showToast(`Welcome back, ${user.profile.firstName || user.profile.name}!`, 'success');
                } catch (toastError) {
                    console.error('Toast error:', toastError);
                }

                // Redirect
                console.log('Login: Redirecting...');
                setTimeout(() => {
                    const returnUrl = window.KinshipUtils.getUrlParameter('return') || '/';
                    console.log('Login: Executing redirect to:', returnUrl);
                    if (window.KinshipRouter) {
                        window.KinshipRouter.navigate(returnUrl);
                    } else {
                        window.location.href = returnUrl === '/' ? 'index.html' : returnUrl;
                    }
                }, 1500);
            } else {
                console.error('Login: Failed to establish user session');
                window.KinshipUtils.showToast('Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            window.KinshipUtils.showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    // Login user (set session)
    loginUser(user) {
        console.log('AuthManager: Logging in user:', user.profile.name);
        this.currentUser = user;

        // Save to storage with error handling
        const saved = window.KinshipStorage.setCurrentUser(user.id);
        if (!saved) {
            console.error('AuthManager: Failed to save user session');
            return false;
        }

        // Update global reference
        window.KinshipApp = window.KinshipApp || {};
        window.KinshipApp.currentUser = user;

        // Dispatch auth state change event for navigation system
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user: user }
        }));

        this.updateUIForAuthenticatedUser();
        console.log('AuthManager: User login completed successfully');
        return true;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        window.KinshipStorage.clearCurrentUser();
        window.KinshipApp.currentUser = null;

        // Dispatch auth state change event for navigation system
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user: null }
        }));

        window.KinshipUtils.showToast('Logged out successfully', 'info');

        // Redirect to home using router if available
        setTimeout(() => {
            if (window.KinshipRouter) {
                window.KinshipRouter.navigate('/');
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    }

    // Update UI for authenticated user
    updateUIForAuthenticatedUser() {
        // Update navigation
        const loginLink = document.querySelector('a[href="auth.html"]');
        if (loginLink && this.currentUser) {
            loginLink.textContent = this.currentUser.profile.name;
            loginLink.href = 'profile.html';
        }

        // Show/hide elements based on auth state
        const authRequiredElements = document.querySelectorAll('[data-auth-required]');
        authRequiredElements.forEach(element => {
            element.style.display = this.currentUser ? 'block' : 'none';
        });

        const guestOnlyElements = document.querySelectorAll('[data-guest-only]');
        guestOnlyElements.forEach(element => {
            element.style.display = this.currentUser ? 'none' : 'block';
        });
    }

    // Switch between login and register tabs
    switchAuthTab(event) {
        event.preventDefault();

        const clickedTab = event.target;
        const targetTab = clickedTab.dataset.tab;

        // Update tab buttons
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        clickedTab.classList.add('active');

        // Update form containers
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        const targetForm = document.getElementById(`${targetTab}-form-container`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    // Show password reset (simplified)
    showPasswordReset(event) {
        event.preventDefault();

        // For the simplified form, just show an alert or prompt
        const email = prompt('Enter your email address to reset your password:');

        if (email && window.KinshipUtils.isValidEmail(email)) {
            // Check if user exists
            const user = window.KinshipStorage.getUserByEmail(email);
            if (!user) {
                window.KinshipUtils.showToast('No account found with this email address', 'error');
                return;
            }

            // In a real app, this would send an email
            window.KinshipUtils.showToast('Password reset link sent to your email!', 'success');
        } else if (email) {
            window.KinshipUtils.showToast('Please enter a valid email address', 'error');
        }
    }

    // Hide password reset modal
    hidePasswordReset() {
        const modal = document.getElementById('password-reset-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    }

    // Handle password reset form submission
    handlePasswordReset(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email');

        if (!email || !window.KinshipUtils.isValidEmail(email)) {
            window.KinshipUtils.showToast('Please enter a valid email address', 'error');
            return;
        }

        // Check if user exists
        const user = window.KinshipStorage.getUserByEmail(email);
        if (!user) {
            window.KinshipUtils.showToast('No account found with this email address', 'error');
            return;
        }

        // In a real app, this would send an email
        // For demo purposes, just show success message
        window.KinshipUtils.showToast('Password reset link sent to your email!', 'success');
        this.hidePasswordReset();

        // Clear form
        form.reset();
    }

    // Validate registration data
    validateRegistrationData(userData) {
        const errors = {};
        let isValid = true;

        // Name validation (for simple form) or First/Last name validation (for complex form)
        if (userData.name) {
            // Simple form validation
            if (!userData.name || userData.name.trim().length < 2) {
                errors.name = 'Name must be at least 2 characters';
                isValid = false;
            }
        } else {
            // Complex form validation
            if (!userData.firstName || userData.firstName.trim().length < 2) {
                errors.firstName = 'First name must be at least 2 characters';
                isValid = false;
            }

            if (!userData.lastName || userData.lastName.trim().length < 2) {
                errors.lastName = 'Last name must be at least 2 characters';
                isValid = false;
            }
        }

        // Email validation
        if (!userData.email || !window.KinshipUtils.isValidEmail(userData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (!userData.password || userData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        // Confirm password validation (only if confirmPassword field exists and is different from password)
        if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        // Location validation (optional for simple form)
        if (userData.location && userData.location !== 'Not specified' && userData.location.trim().length < 2) {
            errors.location = 'Please enter a valid location';
            isValid = false;
        }

        return { isValid, errors };
    }

    // Show form validation errors
    showFormErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error');
            const errorElement = group.querySelector('.error');
            if (errorElement) {
                errorElement.remove();
            }
        });

        // Show new errors
        Object.keys(errors).forEach(fieldName => {
            if (errors[fieldName]) {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    const formGroup = field.closest('.form-group');
                    formGroup.classList.add('has-error');

                    const errorElement = document.createElement('div');
                    errorElement.className = 'error';
                    errorElement.textContent = errors[fieldName];
                    formGroup.appendChild(errorElement);
                }
            }
        });
    }

    // Simple password hashing (not cryptographically secure)
    hashPassword(password) {
        // In a real application, use proper password hashing
        // This is just for demo purposes
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Verify password against hash
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Generate random avatar using online service
    generateRandomAvatar(email) {
        // Use DiceBear API for random avatars
        // Different styles available: avataaars, big-smile, bottts, identicon, initials, etc.
        const styles = ['avataaars', 'big-smile', 'bottts', 'identicon', 'initials', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];

        // Use email as seed to ensure same user gets same avatar
        const seed = email || Math.random().toString(36).substring(7);

        return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`;
    }

    // Setup real-time form validation
    setupRealTimeValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmailField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.name === 'password') {
                input.addEventListener('blur', () => this.validatePasswordField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            }
        });

        // Confirm password validation
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPasswordField(confirmPasswordInput));
            confirmPasswordInput.addEventListener('input', () => this.clearFieldError(confirmPasswordInput));
        }

        // Required field validation
        const requiredInputs = document.querySelectorAll('input[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateRequiredField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    // Validate email field
    validateEmailField(input) {
        const email = input.value.trim();
        if (email && !window.KinshipUtils.isValidEmail(email)) {
            this.showFieldError(input, 'Please enter a valid email address');
            return false;
        }
        return true;
    }

    // Validate password field
    validatePasswordField(input) {
        const password = input.value;
        if (password && password.length < 8) {
            this.showFieldError(input, 'Password must be at least 8 characters');
            return false;
        }
        return true;
    }

    // Validate confirm password field
    validateConfirmPasswordField(input) {
        const confirmPassword = input.value;
        const password = document.getElementById('register-password').value;
        if (confirmPassword && confirmPassword !== password) {
            this.showFieldError(input, 'Passwords do not match');
            return false;
        }
        return true;
    }

    // Validate required field
    validateRequiredField(input) {
        const value = input.value.trim();
        if (!value) {
            this.showFieldError(input, 'This field is required');
            return false;
        }
        return true;
    }

    // Show field error
    showFieldError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('has-error');

        let errorElement = formGroup.querySelector('.error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    // Clear field error
    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('has-error');

        const errorElement = formGroup.querySelector('.error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Handle demo login
    handleDemoLogin() {
        const loginForm = document.getElementById('login-form');
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (emailInput && passwordInput) {
            emailInput.value = 'demo@kinship.com';
            passwordInput.value = 'password123';

            // Switch to login tab if not already active
            const loginTab = document.querySelector('[data-tab="login"]');
            if (loginTab && !loginTab.classList.contains('active')) {
                loginTab.click();
            }

            // Submit the form
            setTimeout(() => {
                if (loginForm) {
                    loginForm.dispatchEvent(new Event('submit'));
                }
            }, 100);
        }
    }

    // Handle social login (placeholder functionality)
    handleSocialLogin(event) {
        event.preventDefault();

        const button = event.currentTarget;
        const provider = button.classList.contains('google') ? 'Google' : 'Facebook';

        // In a real app, this would integrate with OAuth providers
        window.KinshipUtils.showToast(`${provider} login will be available in a future update`, 'info');
    }

    // Require authentication (redirect if not logged in)
    requireAuth() {
        console.log('AuthManager: Checking authentication requirement...');
        console.log('AuthManager: Current user:', this.currentUser && this.currentUser.profile ? this.currentUser.profile.name : 'None');

        if (!this.isAuthenticated()) {
            console.log('AuthManager: Authentication required but user not logged in, redirecting to auth page');
            const currentUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `auth.html?return=${currentUrl}`;
            return false;
        }

        console.log('AuthManager: Authentication check passed');
        return true;
    }

    // Wait for auth to be ready (for use in other modules)
    static waitForAuth() {
        return new Promise((resolve) => {
            if (window.KinshipAuth && window.KinshipAuth.initializationComplete) {
                console.log('AuthManager.waitForAuth: Auth system already ready');
                resolve(window.KinshipAuth);
            } else {
                console.log('AuthManager.waitForAuth: Waiting for auth initialization...');
                window.addEventListener('authInitialized', () => {
                    console.log('AuthManager.waitForAuth: Auth initialization received');
                    resolve(window.KinshipAuth);
                }, { once: true });
            }
        });
    }
}

console.log('Auth.js: AuthManager class defined successfully');

// Make AuthManager globally available (for consistency with other managers)
try {
    window.AuthManager = AuthManager;
    console.log('Auth.js: AuthManager made globally available');
} catch (e) {
    console.error('Auth.js: Error making AuthManager global:', e);
}

// Initialize auth manager immediately
try {
    console.log('Auth: Initializing AuthManager...');
    window.KinshipAuth = new AuthManager();
    console.log('Auth: KinshipAuth instance created successfully');
} catch (e) {
    console.error('Auth: Error creating AuthManager instance:', e);
}

// DISABLED: Create demo users if none exist (for testing purposes)
// createDemoUsersIfNeeded(); // DISABLED - No automatic user creation

// DISABLED: Create demo users for testing
function createDemoUsersIfNeeded() {
    // DISABLED - No automatic user creation
    return; // Exit immediately - don't create any users
    
    /* Original code - disabled
    const users = window.KinshipStorage.getUsers();
    if (!users || users.length === 0) {

        // Create a temporary AuthManager instance to access hashPassword
        const tempAuth = new AuthManager();

        const demoUsers = [
            {
                id: 'demo_user_1',
                email: 'demo@kinship.com',
                password: tempAuth.hashPassword('password123'),
                profile: {
                    name: 'Demo User',
                    firstName: 'Demo',
                    lastName: 'User',
                    phone: '(555) 123-4567',
                    location: 'San Francisco, CA',
                    avatar: tempAuth.generateRandomAvatar('demo@kinship.com'),
                    rating: 4.8,
                    joinDate: new Date().toISOString(),
                    bio: 'Welcome to Kinship! This is a demo account.'
                }
            },
            {
                id: 'demo_user_2',
                email: 'john@example.com',
                password: tempAuth.hashPassword('password123'),
                profile: {
                    name: 'John Smith',
                    firstName: 'John',
                    lastName: 'Smith',
                    phone: '(555) 987-6543',
                    location: 'New York, NY',
                    avatar: tempAuth.generateRandomAvatar('john@example.com'),
                    rating: 4.5,
                    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    bio: 'Passionate about sharing and community building.'
                }
            }
        ];

        demoUsers.forEach(user => {
            window.KinshipStorage.saveUser(user);
        });

        console.log('Demo users created for testing');
    }
    */
}

// Profile management functions
function initializeProfilePage() {
    if (!window.KinshipAuth.requireAuth()) {
        return;
    }

    const currentUser = window.KinshipAuth.getCurrentUser();
    if (!currentUser) return;

    // Populate profile information
    populateProfileInfo(currentUser);

    // Initialize profile tabs
    initializeProfileTabs();

    // Load user's listings
    loadUserListings(currentUser.id);

    // Load user's rentals
    loadUserRentals(currentUser.id);

    // Load user's favorites
    loadUserFavorites(currentUser.id);
}

function populateProfileInfo(user) {
    // Update profile header
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userAvatar = document.getElementById('user-avatar');
    const userRating = document.getElementById('user-rating');

    if (userName) userName.textContent = user.profile.name;
    if (userEmail) userEmail.textContent = user.email;
    if (userAvatar) userAvatar.src = user.profile.avatar;
    if (userRating) userRating.textContent = user.profile.rating.toFixed(1);

    // Update stats
    const totalListings = document.getElementById('total-listings');
    const totalRentals = document.getElementById('total-rentals');

    if (totalListings) {
        const userItems = window.KinshipStorage.getItems({ ownerId: user.id });
        totalListings.textContent = userItems.length;
    }

    if (totalRentals) {
        const userRentals = window.KinshipStorage.getBookings({ renterId: user.id });
        totalRentals.textContent = userRentals.length;
    }
}

function initializeProfileTabs() {
    const tabButtons = document.querySelectorAll('.profile-tabs .tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.dataset.tab;

            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update active tab panel
            tabPanels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById(`${targetTab}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function loadUserListings(userId) {
    const listingsContainer = document.getElementById('user-listings');
    if (!listingsContainer) return;

    const userItems = window.KinshipStorage.getItems({ ownerId: userId });

    if (userItems.length === 0) {
        listingsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6b7280;">
                <p>You haven't listed any items yet.</p>
                <a href="list-item.html" class="btn-primary" style="margin-top: 1rem;">List Your First Item</a>
            </div>
        `;
        return;
    }

    listingsContainer.innerHTML = userItems.map(item => `
        <div class="item-card">
            <img class="item-card-image" src="${item.images[0] || 'assets/images/placeholder.jpg'}" alt="${item.title}">
            <div class="item-card-content">
                <h3 class="item-card-title">${item.title}</h3>
                <p class="item-card-price">${window.KinshipUtils.formatCurrency(item.pricing.daily)}/day</p>
                <p class="item-card-location">${item.location}</p>
                <div class="item-actions">
                    <button class="btn-secondary" onclick="editItem('${item.id}')">Edit</button>
                    <button class="btn-secondary" onclick="deleteItem('${item.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadUserRentals(userId) {
    const currentRentalsContainer = document.getElementById('current-rentals');
    const pastRentalsContainer = document.getElementById('past-rentals');

    if (!currentRentalsContainer || !pastRentalsContainer) return;

    const userRentals = window.KinshipStorage.getBookings({ renterId: userId });
    const currentDate = new Date();

    const currentRentals = userRentals.filter(rental =>
        new Date(rental.endDate) >= currentDate && rental.status === 'confirmed'
    );

    const pastRentals = userRentals.filter(rental =>
        new Date(rental.endDate) < currentDate || rental.status === 'completed'
    );

    // Display current rentals
    if (currentRentals.length === 0) {
        currentRentalsContainer.innerHTML = '<p>No current rentals.</p>';
    } else {
        currentRentalsContainer.innerHTML = currentRentals.map(rental => {
            const item = window.KinshipStorage.getItem(rental.itemId);
            return `
                <div class="rental-card">
                    <h4>${item ? item.title : 'Item not found'}</h4>
                    <p>From: ${window.KinshipUtils.formatDate(rental.startDate)}</p>
                    <p>To: ${window.KinshipUtils.formatDate(rental.endDate)}</p>
                    <p>Total: ${window.KinshipUtils.formatCurrency(rental.totalPrice)}</p>
                </div>
            `;
        }).join('');
    }

    // Display past rentals
    if (pastRentals.length === 0) {
        pastRentalsContainer.innerHTML = '<p>No past rentals.</p>';
    } else {
        pastRentalsContainer.innerHTML = pastRentals.map(rental => {
            const item = window.KinshipStorage.getItem(rental.itemId);
            return `
                <div class="rental-card">
                    <h4>${item ? item.title : 'Item not found'}</h4>
                    <p>From: ${window.KinshipUtils.formatDate(rental.startDate)}</p>
                    <p>To: ${window.KinshipUtils.formatDate(rental.endDate)}</p>
                    <p>Total: ${window.KinshipUtils.formatCurrency(rental.totalPrice)}</p>
                </div>
            `;
        }).join('');
    }
}

function loadUserFavorites(userId) {
    const favoritesContainer = document.getElementById('favorite-items');
    if (!favoritesContainer) return;

    const favoriteIds = window.KinshipStorage.getFavorites(userId);

    if (favoriteIds.length === 0) {
        favoritesContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6b7280;">
                <p>You haven't favorited any items yet.</p>
                <a href="browse.html" class="btn-primary" style="margin-top: 1rem;">Browse Items</a>
            </div>
        `;
        return;
    }

    const favoriteItems = favoriteIds.map(id => window.KinshipStorage.getItem(id)).filter(Boolean);

    favoritesContainer.innerHTML = favoriteItems.map(item => `
        <div class="item-card">
            <img class="item-card-image" src="${item.images[0] || 'assets/images/placeholder.jpg'}" alt="${item.title}">
            <div class="item-card-content">
                <h3 class="item-card-title">${item.title}</h3>
                <p class="item-card-price">${window.KinshipUtils.formatCurrency(item.pricing.daily)}/day</p>
                <p class="item-card-location">${item.location}</p>
                <button class="btn-primary" onclick="viewItem('${item.id}')">View Details</button>
            </div>
        </div>
    `).join('');
}

// Helper functions for profile actions
function editItem(itemId) {
    window.location.href = `list-item.html?edit=${itemId}`;
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        window.KinshipStorage.deleteItem(itemId);
        window.KinshipUtils.showToast('Item deleted successfully', 'success');
        location.reload();
    }
}

function viewItem(itemId) {
    window.location.href = `item-detail.html?id=${itemId}`;
}