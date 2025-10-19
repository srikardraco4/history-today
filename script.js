let currentHistoryData = { Events: [], Births: [], Deaths: [] };

let selectedRadialMonth = new Date().getMonth(); // 0-indexed
let selectedRadialDay = new Date().getDate();
let selectedRadialYear = new Date().getFullYear(); // For century/decade calculation

let currentMonthRotation = 0;
let currentDayRotation = 0;

let monthsRing; // Global declaration
let daysRing;   // Global declaration

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
// API configuration
const API_BASE_URL = window.location.origin;

// Then update your fetchHistoryForRadial function:
async function fetchHistoryForRadial() {
    const month = monthNames[selectedRadialMonth];
    const day = selectedRadialDay;

    if (!month || !day) {
        alert('Please select a complete date.');
        return;
    }

    console.log(`Fetching history for: ${month} ${day}`);
    showLoadingSpinners(true);

    // Use relative URL - the browser will automatically use the same origin
    const url = `/getHistory?month=${month}&day=${day}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        currentHistoryData = data;
        displayFilteredData(currentHistoryData);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        displayError();
    } finally {
        showLoadingSpinners(false);
    }
}


async function fetchHistoryForRadial() {
    const month = monthNames[selectedRadialMonth];
    const day = selectedRadialDay;

    if (!month || !day) {
        alert('Please select a complete date.');
        return;
    }

    console.log(`Fetching history for: ${month} ${day}`);
    showLoadingSpinners(true);

    const url = `http://localhost:10000/getHistory?month=${month}&day=${day}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        currentHistoryData = data; // Store the fetched data
        displayFilteredData(currentHistoryData); // Display all data initially
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        displayError();
    } finally {
        showLoadingSpinners(false);
    }
}

function applySearchFilter() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase();

    const filteredData = {
        Events: filterItems(currentHistoryData.Events, searchTerm),
        Births: filterItems(currentHistoryData.Births, searchTerm),
        Deaths: filterItems(currentHistoryData.Deaths, searchTerm)
    };

    displayFilteredData(filteredData);
}

function filterItems(items, searchTerm) {
    if (!searchTerm) {
        return items; // If no search term, return all items
    }
    return items.filter(item => item.toLowerCase().includes(searchTerm));
}

function displayFilteredData(dataToDisplay) {
    displayData('events', dataToDisplay.Events);
    displayData('births', dataToDisplay.Births);
    displayData('deaths', dataToDisplay.Deaths);
}

function showLoadingSpinners(show) {
    const contentAreas = document.querySelectorAll('.content-area');
    contentAreas.forEach(area => {
        const spinner = area.querySelector('.spinner');
        if (show) {
            area.innerHTML = ''; // Clear previous content
            if (spinner) {
                area.appendChild(spinner);
                spinner.style.display = 'block';
            }
        } else {
            if (spinner) {
                spinner.style.display = 'none';
            }
        }
    });
}

function displayData(sectionId, items) {
    const contentArea = document.querySelector(`#${sectionId} .content-area`);
    contentArea.innerHTML = ''; // Clear spinner or previous content

    if (!items || items.length === 0) {
        contentArea.innerHTML = '<p>No data available for this date or matching your search.</p>';
        return;
    }

    const ul = document.createElement('ul');
    items.forEach(itemText => {
        const li = document.createElement('li');
        li.textContent = itemText;
        ul.appendChild(li);
    });
    contentArea.appendChild(ul);
}

function displayError() {
    const contentAreas = document.querySelectorAll('.content-area');
    contentAreas.forEach(area => {
        area.innerHTML = '<p>Could not retrieve data. Please ensure the server is running and try again.</p>';
    });
}


function adjustBodyPadding() {
    const header = document.querySelector('header');
    if (header) {
        document.body.style.paddingTop = header.offsetHeight + 'px';
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    adjustBodyPadding();
    initializeRadialCalendar();

    const randomSpinButton = document.getElementById('random-spin-button');
    if (randomSpinButton) {
        randomSpinButton.addEventListener('click', randomizeDateAndSpin);
    }
});
// Call on resize
window.addEventListener('resize', adjustBodyPadding);

function showTodaysHistory() {
    const today = new Date();
    selectedRadialMonth = today.getMonth();
    selectedRadialDay = today.getDate();

    updateRadialCalendarDisplay();

    const monthRotation = selectedRadialMonth * (360 / 12);
    rotateRing(monthsRing, monthRotation, 'month');

    const numDaysForSelectedMonth = daysInMonth(selectedRadialMonth, selectedRadialYear);
    const dayRotation = selectedRadialDay * (360 / numDaysForSelectedMonth);
    rotateRing(daysRing, dayRotation, 'day');

    fetchHistoryForRadial();
}

document.addEventListener('DOMContentLoaded', () => {
    const todaysHistoryButton = document.getElementById('todays-history-button');
    if (todaysHistoryButton) {
        todaysHistoryButton.addEventListener('click', showTodaysHistory);
    }
});

function getWikipediaDateParts(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    return { month, day };
}

function rotateRing(ringElement, itemRotation, type) { // itemRotation is the rotation of the item itself
    let currentRingRotation = (type === 'month' ? currentMonthRotation : currentDayRotation);
    
    // Calculate the target rotation for the ring to bring the item to the "top" (0 degrees)
    let targetRingRotation = -itemRotation;

    // Normalize current and target degrees to be within 0-360 for shortest path calculation
    currentRingRotation = (currentRingRotation % 360 + 360) % 360;
    targetRingRotation = (targetRingRotation % 360 + 360) % 360;

    let diff = targetRingRotation - currentRingRotation;

    // Calculate shortest path
    if (diff > 180) {
        diff -= 360;
    } else if (diff < -180) {
        diff += 360;
    }
    const newRotation = currentRingRotation + diff;
    ringElement.style.transform = `rotate(${newRotation}deg)`;

    if (type === 'month') {
        currentMonthRotation = newRotation;
    } else {
        currentDayRotation = newRotation;
    }
}

function populateDays() {
    daysRing.innerHTML = '';
    const numDays = daysInMonth(selectedRadialMonth, selectedRadialYear);
    for (let i = 1; i <= numDays; i++) {
        const dayRotation = i * (360 / numDays);
        const dayItem = document.createElement('div');
        dayItem.classList.add('ring-item', 'day-item');
        dayItem.textContent = i;
        dayItem.dataset.day = i;
        dayItem.style.transform = `rotate(${dayRotation}deg) translate(160px)`; /* Adjusted translate for more space */
        dayItem.addEventListener('click', () => {
            selectedRadialDay = i;
            updateRadialCalendarDisplay();
            rotateRing(daysRing, dayRotation, 'day');
        });
        daysRing.appendChild(dayItem);
    }
}

function updateRadialCalendarDisplay() {
    const summaryElement = document.getElementById('selected-date-summary');
    const monthName = monthNames[selectedRadialMonth];
    summaryElement.textContent = `${monthName} ${selectedRadialDay}, ${selectedRadialYear}`;

    // Update selected classes
    document.querySelectorAll('.month-item').forEach(item => {
        item.classList.toggle('selected', parseInt(item.dataset.month) === selectedRadialMonth);
    });
    document.querySelectorAll('.day-item').forEach(item => {
        item.classList.toggle('selected', parseInt(item.dataset.day) === selectedRadialDay);
    });

    populateDays(); // Re-populate days if month changes
    
    // Re-apply selected class for days after re-population
    document.querySelectorAll('.day-item').forEach(item => {
        item.classList.toggle('selected', parseInt(item.dataset.day) === selectedRadialDay);
    });
}

function initializeRadialCalendar() {
    monthsRing = document.querySelector('.months-ring');
    daysRing = document.querySelector('.days-ring');

    // Populate Months Ring
    monthsRing.innerHTML = '';
    monthNames.forEach((month, index) => {
        const monthItem = document.createElement('div');
        monthItem.classList.add('ring-item', 'month-item');
        monthItem.textContent = month;
        monthItem.dataset.month = index;
        const monthRotation = index * (360 / 12);
        monthItem.style.transform = `rotate(${monthRotation}deg) translate(110px)`; /* Adjusted translate for more space */
        monthItem.addEventListener('click', () => {
            selectedRadialMonth = index;
            updateRadialCalendarDisplay();
            rotateRing(monthsRing, monthRotation, 'month');
        });
        monthsRing.appendChild(monthItem);
    });

    // Initial population and display
    populateDays();
    updateRadialCalendarDisplay();

    // Initial rotation to today's date
    // Initial rotation to today's date (or selected date if already set)
    const initialMonthRotation = selectedRadialMonth * (360 / 12);
    rotateRing(monthsRing, initialMonthRotation, 'month');

    const numDaysForSelectedMonth = daysInMonth(selectedRadialMonth, selectedRadialYear);
    const initialDayRotation = selectedRadialDay * (360 / numDaysForSelectedMonth);
    rotateRing(daysRing, initialDayRotation, 'day');
}

function randomizeDateAndSpin() {
    // Select a random month
    const randomMonthIndex = Math.floor(Math.random() * 12);
    selectedRadialMonth = randomMonthIndex;

    // Select a random day for the chosen month
    const numDays = daysInMonth(selectedRadialMonth, selectedRadialYear);
    const randomDay = Math.floor(Math.random() * numDays) + 1;
    selectedRadialDay = randomDay;

    // Update display and rotate rings
    updateRadialCalendarDisplay();

    const monthRotation = selectedRadialMonth * (360 / 12);
    rotateRing(monthsRing, monthRotation, 'month');

    const dayRotation = selectedRadialDay * (360 / numDays);
    rotateRing(daysRing, dayRotation, 'day');

    fetchHistoryForRadial(); // Fetch data for the new random date
}



