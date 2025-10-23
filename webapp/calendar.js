let currentUser = localStorage.getItem('currentUser');
let persistentSession = localStorage.getItem('persistentSession');
let startDate = null;
let relapses = [];
let currentMonth = new Date();
let selectedDate = null;

// Redirect to login if not authenticated
if (!currentUser || persistentSession !== 'true') {
    window.location.href = 'login.html';
}

// Update last activity timestamp to maintain session
localStorage.setItem('lastActivity', new Date().toISOString());

function navigateTo(page) {
    window.location.href = page;
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    document.getElementById('currentMonth').textContent =
        currentMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' });

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;

        const currentDate = new Date(year, month, day);
        const dateStr = currentDate.toISOString().split('T')[0];

        if (startDate && dateStr === new Date(startDate).toISOString().split('T')[0]) {
            dayEl.classList.add('start-date');
        }

        if (relapses.includes(dateStr)) {
            dayEl.classList.add('relapse');
        }

        dayEl.onclick = () => openRelapseModal(currentDate);
        grid.appendChild(dayEl);
    }
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

function openRelapseModal(date) {
    selectedDate = date;
    document.getElementById('relapseModal').classList.add('active');
}

function closeModal() {
    document.getElementById('relapseModal').classList.remove('active');
    selectedDate = null;
}

function registerRelapse() {
    if (selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        if (!relapses.includes(dateStr)) {
            relapses.push(dateStr);
        }
        startDate = selectedDate;
        saveData();
        renderCalendar();
    }
    closeModal();
}

function saveData() {
    const data = {
        startDate,
        relapses,
        topics: JSON.parse(localStorage.getItem(`sobrietyApp_${currentUser}`))?.topics || []
    };
    const key = `sobrietyApp_${currentUser}`;
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData() {
    const key = `sobrietyApp_${currentUser}`;
    const saved = localStorage.getItem(key);

    if (saved) {
        const data = JSON.parse(saved);
        startDate = data.startDate ? new Date(data.startDate) : new Date();
        relapses = data.relapses || [];
    } else {
        startDate = new Date();
        relapses = [];
    }
}

// Initialize
loadData();
renderCalendar();
