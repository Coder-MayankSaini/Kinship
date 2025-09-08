/**
 * Availability Calendar for List Item Form
 * Handles date selection and availability management
 */

class AvailabilityCalendar {
    constructor() {
        this.selectedDates = [];
        this.currentMonth = new Date();
        this.availabilityType = 'always';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCalendar();
    }

    setupEventListeners() {
        // Radio buttons for availability type
        const availabilityRadios = document.querySelectorAll('input[name="availability-type"]');
        availabilityRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.availabilityType = e.target.value;
                this.toggleCalendarDisplay();
            });
        });
    }

    toggleCalendarDisplay() {
        const calendarWidget = document.getElementById('availability-calendar');
        if (!calendarWidget) return;

        if (this.availabilityType === 'specific') {
            calendarWidget.style.display = 'block';
            this.renderCalendar();
        } else {
            calendarWidget.style.display = 'none';
            this.selectedDates = []; // Clear selected dates
        }
    }

    initializeCalendar() {
        const calendarWidget = document.getElementById('availability-calendar');
        if (!calendarWidget) return;

        // Add calendar structure
        calendarWidget.innerHTML = `
            <div class="calendar-header">
                <button type="button" class="calendar-nav prev-month" aria-label="Previous month">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"/>
                    </svg>
                </button>
                <h3 class="calendar-month-year"></h3>
                <button type="button" class="calendar-nav next-month" aria-label="Next month">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                    </svg>
                </button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-weekdays"></div>
                <div class="calendar-days"></div>
            </div>
            <div class="calendar-footer">
                <p class="selected-dates-info">Select the dates your item is available for rent</p>
                <button type="button" class="clear-dates-btn" style="display: none;">Clear all dates</button>
            </div>
        `;

        // Add navigation event listeners
        calendarWidget.querySelector('.prev-month').addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
            this.renderCalendar();
        });

        calendarWidget.querySelector('.next-month').addEventListener('click', () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
            this.renderCalendar();
        });

        // Clear dates button
        calendarWidget.querySelector('.clear-dates-btn').addEventListener('click', () => {
            this.selectedDates = [];
            this.renderCalendar();
        });
    }

    renderCalendar() {
        const calendarWidget = document.getElementById('availability-calendar');
        if (!calendarWidget) return;

        const monthYearElement = calendarWidget.querySelector('.calendar-month-year');
        const weekdaysElement = calendarWidget.querySelector('.calendar-weekdays');
        const daysElement = calendarWidget.querySelector('.calendar-days');
        const clearButton = calendarWidget.querySelector('.clear-dates-btn');
        const infoElement = calendarWidget.querySelector('.selected-dates-info');

        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearElement.textContent = `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;

        // Render weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdaysElement.innerHTML = weekdays.map(day => 
            `<div class="calendar-weekday">${day}</div>`
        ).join('');

        // Calculate days for current month
        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
        const startPadding = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        // Clear and render days
        daysElement.innerHTML = '';

        // Add padding for first week
        for (let i = 0; i < startPadding; i++) {
            daysElement.innerHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
            const dateStr = this.formatDate(date);
            const isPast = date < today;
            const isSelected = this.selectedDates.includes(dateStr);
            const isToday = date.getTime() === today.getTime();

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            if (isPast) dayElement.classList.add('past');
            if (isSelected) dayElement.classList.add('selected');
            if (isToday) dayElement.classList.add('today');
            
            dayElement.innerHTML = `
                <button type="button" 
                        class="calendar-day-button" 
                        ${isPast ? 'disabled' : ''}
                        data-date="${dateStr}"
                        aria-label="${isPast ? 'Past date' : `Select ${dateStr}`}"
                        aria-pressed="${isSelected}">
                    ${day}
                </button>
            `;

            if (!isPast) {
                dayElement.querySelector('.calendar-day-button').addEventListener('click', (e) => {
                    this.toggleDate(dateStr);
                    e.target.setAttribute('aria-pressed', this.selectedDates.includes(dateStr));
                    this.renderCalendar();
                });
            }

            daysElement.appendChild(dayElement);
        }

        // Update footer
        if (this.selectedDates.length > 0) {
            infoElement.textContent = `${this.selectedDates.length} date${this.selectedDates.length > 1 ? 's' : ''} selected`;
            clearButton.style.display = 'inline-block';
        } else {
            infoElement.textContent = 'Select the dates your item is available for rent';
            clearButton.style.display = 'none';
        }
    }

    toggleDate(dateStr) {
        const index = this.selectedDates.indexOf(dateStr);
        if (index > -1) {
            this.selectedDates.splice(index, 1);
        } else {
            this.selectedDates.push(dateStr);
        }
        this.selectedDates.sort();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getAvailabilityData() {
        return {
            type: this.availabilityType,
            dates: this.availabilityType === 'specific' ? this.selectedDates : []
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.availabilityCalendar = new AvailabilityCalendar();
});

// Export for use in listings form
window.AvailabilityCalendar = AvailabilityCalendar;
