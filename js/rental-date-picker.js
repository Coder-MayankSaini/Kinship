/**
 * Rental Date Picker for Item Detail Page
 * Handles date selection based on item availability
 */

class RentalDatePicker {
    constructor(itemId, availability) {
        this.itemId = itemId;
        this.availability = availability || { type: 'always', dates: [] };
        this.selectedStartDate = null;
        this.selectedEndDate = null;
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
                <div class="date-selection-display">
                    <div class="selected-date-info">
                        <span class="date-label">Start Date:</span>
                        <span class="date-value" id="selected-start-date">Select a date</span>
                    </div>
                    <div class="selected-date-info">
                        <span class="date-label">End Date:</span>
                        <span class="date-value" id="selected-end-date">Select a date</span>
                    </div>
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
                <div class="selection-instruction" id="selection-instruction">Click on a date to select your rental period</div>
                <div class="calendar-legend">
                    <span class="legend-item available"><span class="legend-dot"></span>Available</span>
                    <span class="legend-item unavailable"><span class="legend-dot"></span>Unavailable</span>
                    <span class="legend-item booked"><span class="legend-dot"></span>Booked</span>
                    <span class="legend-item selected"><span class="legend-dot"></span>Selected</span>
                </div>
                <div class="availability-message" id="availability-message"></div>
            </div>
        `;

        this.setupNavigation();
        this.renderCalendar();
        this.updateDateDisplay();
        this.updateAvailabilityMessage();
    }

    updateDateDisplay() {
        const startDateElement = document.getElementById('selected-start-date');
        const endDateElement = document.getElementById('selected-end-date');
        const instructionElement = document.getElementById('selection-instruction');
        
        if (startDateElement) {
            startDateElement.textContent = this.selectedStartDate ? 
                new Date(this.selectedStartDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }) : 'Select a date';
            startDateElement.classList.toggle('selected', !!this.selectedStartDate);
        }
        
        if (endDateElement) {
            endDateElement.textContent = this.selectedEndDate ? 
                new Date(this.selectedEndDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }) : 'Select a date';
            endDateElement.classList.toggle('selected', !!this.selectedEndDate);
        }
        
        // Update instruction text
        if (instructionElement) {
            if (!this.selectedStartDate) {
                instructionElement.textContent = 'Click on an available date to select START date';
                instructionElement.className = 'selection-instruction start-mode';
            } else if (!this.selectedEndDate) {
                instructionElement.textContent = 'Now click on another date to select END date';
                instructionElement.className = 'selection-instruction end-mode';
            } else {
                instructionElement.textContent = 'Dates selected! Click "Rent Selected Dates" or click any date to change selection';
                instructionElement.className = 'selection-instruction complete';
            }
        }
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
            const isSelected = this.isDateInSelectedRange(dateStr);

            let classes = ['calendar-date'];
            if (isPast) classes.push('past');
            else if (isBooked) classes.push('booked');
            else if (!isAvailable) classes.push('unavailable');
            else classes.push('available');
            
            if (isSelected) classes.push('selected');
            if (dateStr === this.selectedStartDate) classes.push('start-date');
            if (dateStr === this.selectedEndDate) classes.push('end-date');

            const dayElement = document.createElement('div');
            dayElement.className = classes.join(' ');
            dayElement.innerHTML = `
                <button type="button" 
                        class="date-button" 
                        data-date="${dateStr}"
                        ${isPast || isBooked || (!isAvailable && this.availability.type === 'specific') ? 'disabled' : ''}
                        aria-label="${this.getDateAriaLabel(date, isAvailable, isBooked)}">
                    ${day}
                </button>
            `;

            if (!isPast && !isBooked && isAvailable) {
                dayElement.querySelector('.date-button').addEventListener('click', (e) => {
                    this.handleDateClick(dateStr);
                });
            }

            datesContainer.appendChild(dayElement);
        }
    }

    handleDateClick(dateStr) {
        if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
            // Start new selection
            this.selectedStartDate = dateStr;
            this.selectedEndDate = null;
        } else {
            // Select end date
            const startDate = new Date(this.selectedStartDate);
            const clickedDate = new Date(dateStr);

            if (clickedDate > startDate) {
                if (this.isDateRangeAvailable(this.selectedStartDate, dateStr)) {
                    this.selectedEndDate = dateStr;
                } else {
                    alert('Some dates in this range are not available. Please select different dates.');
                    return;
                }
            } else if (clickedDate.getTime() === startDate.getTime()) {
                // Clicked on the same date - deselect
                this.selectedStartDate = null;
                this.selectedEndDate = null;
            } else {
                // If clicked date is before start date, reset selection
                this.selectedStartDate = dateStr;
                this.selectedEndDate = null;
            }
        }

        this.renderCalendar();
        this.updateDateDisplay();
        this.updateRentalButton();
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

    isDateRangeAvailable(startDateStr, endDateStr) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            if (!this.isDateAvailable(this.formatDate(currentDate))) {
                return false;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return true;
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

    isDateInSelectedRange(dateStr) {
        if (!this.selectedStartDate || !this.selectedEndDate) return false;

        const date = new Date(dateStr);
        const startDate = new Date(this.selectedStartDate);
        const endDate = new Date(this.selectedEndDate);

        return date >= startDate && date <= endDate;
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getDateAriaLabel(date, isAvailable, isBooked) {
        const dateStr = date.toLocaleDateString();
        if (isBooked) return `${dateStr} - Already booked`;
        if (!isAvailable) return `${dateStr} - Not available`;
        return `${dateStr} - Available for booking`;
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
            if (this.selectedStartDate && this.selectedEndDate) {
                rentButton.textContent = 'Rent Selected Dates';
                rentButton.classList.add('has-dates');
                
                // Update rental modal dates when rent button is clicked
                rentButton.onclick = () => {
                    const startDateInput = document.getElementById('start-date');
                    const endDateInput = document.getElementById('end-date');
                    
                    if (startDateInput) startDateInput.value = this.selectedStartDate;
                    if (endDateInput) endDateInput.value = this.selectedEndDate;
                    
                    // Trigger the original click handler
                    if (window.itemDetailPage) {
                        window.itemDetailPage.openRentalModal();
                    }
                };
            } else {
                rentButton.textContent = 'Select Dates to Rent';
                rentButton.classList.remove('has-dates');
            }
        }
    }

    getSelectedDates() {
        return {
            start: this.selectedStartDate,
            end: this.selectedEndDate
        };
    }
}

// Export for use
window.RentalDatePicker = RentalDatePicker;
