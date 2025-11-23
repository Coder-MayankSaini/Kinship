/**
 * Multi-Date Picker for Item Detail Page
 * Allows selecting multiple individual dates
 */

class MultiDatePicker {
    constructor(itemId, availability) {
        this.itemId = itemId;
        this.availability = availability || { type: 'always', dates: [] };
        this.selectedDates = []; // Array of selected dates
        this.currentMonth = new Date();
        this.existingBookings = [];
        this.init();
    }

    init() {
        // Get existing bookings for this item
        if (window.KinshipStorage) {
            this.existingBookings = window.KinshipStorage.getBookings({ itemId: this.itemId }) || [];
        }
        this.render();
    }

    render() {
        const calendarWidget = document.getElementById('calendar-widget');
        if (!calendarWidget) return;

        calendarWidget.innerHTML = `
            <div class="rental-calendar-container">
                <div class="date-selection-summary">
                    <div class="selection-count">
                        <span class="count-number" id="selected-count">0</span>
                        <span class="count-label">dates selected</span>
                    </div>
                    <button type="button" class="clear-selection-btn" id="clear-selection" style="display: none;">
                        Clear All
                    </button>
                </div>
                <div class="calendar-navigation">
                    <button type="button" class="cal-nav-btn prev-month" aria-label="Previous month">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"/>
                        </svg>
                    </button>
                    <h4 class="calendar-month-display"></h4>
                    <button type="button" class="cal-nav-btn next-month" aria-label="Next month">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                        </svg>
                    </button>
                </div>
                <div class="calendar-grid-container">
                    <div class="weekday-headers"></div>
                    <div class="calendar-dates-grid"></div>
                </div>
                <div class="selected-dates-list" id="selected-dates-list" style="display: none;">
                    <h5>Selected Dates:</h5>
                    <div class="dates-pills" id="dates-pills"></div>
                </div>
                <div class="calendar-legend">
                    <span class="legend-item available"><span class="legend-dot"></span>Available</span>
                    <span class="legend-item unavailable"><span class="legend-dot"></span>Unavailable</span>
                    <span class="legend-item booked"><span class="legend-dot"></span>Booked</span>
                    <span class="legend-item selected"><span class="legend-dot"></span>Selected</span>
                </div>
                <div class="selection-instruction">Click on available dates to add/remove them from your selection</div>
                <div class="availability-message" id="availability-message"></div>
            </div>
        `;

        this.setupNavigation();
        this.setupClearButton();
        this.renderCalendar();
        this.updateAvailabilityMessage();
    }

    setupNavigation() {
        const prevBtn = document.querySelector('.prev-month');
        const nextBtn = document.querySelector('.next-month');

        prevBtn.addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
            this.renderCalendar();
        });

        nextBtn.addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
            this.renderCalendar();
        });
    }

    setupClearButton() {
        const clearBtn = document.getElementById('clear-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.selectedDates = [];
                this.renderCalendar();
                this.updateSelectionDisplay();
                this.updateRentalButton();
            });
        }
    }

    renderCalendar() {
        // Update month display
        const monthDisplay = document.querySelector('.calendar-month-display');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthDisplay.textContent = `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;

        // Render weekday headers
        const weekdaysContainer = document.querySelector('.weekday-headers');
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdaysContainer.innerHTML = weekdays.map(day => 
            `<div class="weekday-header">${day}</div>`
        ).join('');

        // Calculate days for current month
        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
        const startPadding = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        // Render days
        const datesContainer = document.querySelector('.calendar-dates-grid');
        datesContainer.innerHTML = '';

        // Add padding for first week
        for (let i = 0; i < startPadding; i++) {
            datesContainer.innerHTML += '<div class="calendar-date empty"></div>';
        }

        // Add days of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
            const dateStr = this.formatDate(date);
            const isPast = date < today;
            const isAvailable = this.isDateAvailable(dateStr);
            const isBooked = this.isDateBooked(dateStr);
            const isSelected = this.selectedDates.includes(dateStr);

            let classes = ['calendar-date'];
            if (isPast) classes.push('past');
            else if (isBooked) classes.push('booked');
            else if (!isAvailable) classes.push('unavailable');
            else classes.push('available');
            
            if (isSelected) classes.push('selected');

            const dayElement = document.createElement('div');
            dayElement.className = classes.join(' ');
            dayElement.innerHTML = `
                <button type="button" 
                        class="date-button" 
                        data-date="${dateStr}"
                        ${isPast || isBooked || (!isAvailable && this.availability.type === 'specific') ? 'disabled' : ''}
                        aria-label="${this.getDateAriaLabel(date, isAvailable, isBooked, isSelected)}"
                        aria-pressed="${isSelected}">
                    ${day}
                    ${isSelected ? '<span class="checkmark">✓</span>' : ''}
                </button>
            `;

            if (!isPast && !isBooked && isAvailable) {
                dayElement.querySelector('.date-button').addEventListener('click', (e) => {
                    this.handleDateClick(dateStr);
                });
            }

            datesContainer.appendChild(dayElement);
        }

        this.updateSelectionDisplay();
    }

    handleDateClick(dateStr) {
        const index = this.selectedDates.indexOf(dateStr);
        
        if (index > -1) {
            // Date is already selected, remove it
            this.selectedDates.splice(index, 1);
        } else {
            // Add the date to selection
            this.selectedDates.push(dateStr);
        }
        
        // Sort dates chronologically
        this.selectedDates.sort();
        
        this.renderCalendar();
        this.updateSelectionDisplay();
        this.updateRentalButton();
    }

    updateSelectionDisplay() {
        const countElement = document.getElementById('selected-count');
        const clearBtn = document.getElementById('clear-selection');
        const datesList = document.getElementById('selected-dates-list');
        const datesPills = document.getElementById('dates-pills');
        
        // Update count
        countElement.textContent = this.selectedDates.length;
        
        // Show/hide clear button
        clearBtn.style.display = this.selectedDates.length > 0 ? 'inline-block' : 'none';
        
        // Show/hide dates list
        datesList.style.display = this.selectedDates.length > 0 ? 'block' : 'none';
        
        // Update dates pills
        if (this.selectedDates.length > 0) {
            datesPills.innerHTML = this.selectedDates.map(dateStr => {
                const date = new Date(dateStr);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                return `
                    <span class="date-pill">
                        ${formattedDate}
                        <button type="button" class="remove-date" data-date="${dateStr}" aria-label="Remove ${formattedDate}">
                            ×
                        </button>
                    </span>
                `;
            }).join('');
            
            // Add remove handlers
            datesPills.querySelectorAll('.remove-date').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dateToRemove = btn.dataset.date;
                    this.handleDateClick(dateToRemove);
                });
            });
        }
    }

    isDateAvailable(dateStr) {
        // Check if date is in the past
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return false;

        // Check availability type
        if (this.availability.type === 'always') {
            // Always available unless booked
            return !this.isDateBooked(dateStr);
        } else {
            // Specific dates only
            return this.availability.dates.includes(dateStr) && !this.isDateBooked(dateStr);
        }
    }

    isDateBooked(dateStr) {
        const date = new Date(dateStr);

        for (const booking of this.existingBookings) {
            if (booking.status === 'cancelled' || booking.status === 'rejected') {
                continue;
            }

            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);

            if (date >= startDate && date <= endDate) {
                return true;
            }
        }

        return false;
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getDateAriaLabel(date, isAvailable, isBooked, isSelected) {
        const dateStr = date.toLocaleDateString();
        let status = '';
        
        if (isBooked) status = 'Already booked';
        else if (!isAvailable) status = 'Not available';
        else if (isSelected) status = 'Selected';
        else status = 'Available';
        
        return `${dateStr} - ${status}. ${isSelected ? 'Click to deselect' : 'Click to select'}`;
    }

    updateAvailabilityMessage() {
        const messageDiv = document.getElementById('availability-message');
        
        if (this.availability.type === 'always') {
            messageDiv.innerHTML = '<strong>✓ Available anytime</strong> (except booked dates)';
            messageDiv.className = 'availability-message available';
        } else if (this.availability.dates && this.availability.dates.length > 0) {
            messageDiv.innerHTML = `<strong>Available on specific dates only</strong> (${this.availability.dates.length} dates available)`;
            messageDiv.className = 'availability-message specific';
        } else {
            messageDiv.innerHTML = '<strong>⚠ Not currently available</strong>';
            messageDiv.className = 'availability-message unavailable';
        }
    }

    updateRentalButton() {
        const rentButton = document.getElementById('rent-now-btn');
        if (rentButton) {
            if (this.selectedDates.length > 0) {
                const daysText = this.selectedDates.length === 1 ? 'day' : 'days';
                rentButton.textContent = `Rent for ${this.selectedDates.length} ${daysText}`;
                rentButton.classList.add('has-dates');
                
                // Update rental modal dates when rent button is clicked
                rentButton.onclick = () => {
                    // For the rental modal, we'll use the first and last selected dates
                    if (this.selectedDates.length > 0) {
                        const sortedDates = [...this.selectedDates].sort();
                        const startDateInput = document.getElementById('start-date');
                        const endDateInput = document.getElementById('end-date');
                        
                        if (startDateInput) startDateInput.value = sortedDates[0];
                        if (endDateInput) endDateInput.value = sortedDates[sortedDates.length - 1];
                        
                        console.log('MultiDatePicker setting modal dates:', {
                            selectedDatesCount: this.selectedDates.length,
                            startDate: sortedDates[0],
                            endDate: sortedDates[sortedDates.length - 1],
                            allSelectedDates: this.selectedDates
                        });
                    }
                    
                    // Trigger the original click handler
                    if (window.itemDetailPage) {
                        window.itemDetailPage.openRentalModal();
                        
                        // Trigger cost calculation after modal opens
                        setTimeout(() => {
                            if (window.itemDetailPage.updateRentalCost) {
                                console.log('Triggering rental cost update after modal open');
                                window.itemDetailPage.updateRentalCost();
                            }
                        }, 100);
                    }
                };
            } else {
                rentButton.textContent = 'Select Dates to Rent';
                rentButton.classList.remove('has-dates');
            }
        }
    }

    getSelectedDates() {
        return this.selectedDates;
    }

    // Get date range for compatibility with existing booking system
    getDateRange() {
        if (this.selectedDates.length === 0) {
            return { start: null, end: null };
        }
        
        const sortedDates = [...this.selectedDates].sort();
        return {
            start: sortedDates[0],
            end: sortedDates[sortedDates.length - 1]
        };
    }
}

// Export for use
window.MultiDatePicker = MultiDatePicker;
