document.addEventListener('DOMContentLoaded', () => {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendar = document.getElementById('calendar');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    let selectedDate = null;

    let currentDate = new Date();

    function generateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const firstDayOfWeek = firstDay.getDay();
        const lastDayOfWeek = lastDay.getDay();

        const prevMonthDays = firstDayOfWeek;
        const nextMonthDays = 6 - lastDayOfWeek;

        const totalCells = prevMonthDays + daysInMonth + nextMonthDays;

        let calendarHTML = '<table class="calendar-table">';
        calendarHTML += '<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>';
        calendarHTML += '<tr>';

        let dayCounter = 1;
        for (let i = 0; i < totalCells; i++) {
            if (i < prevMonthDays || dayCounter > daysInMonth) {
                calendarHTML += '<td></td>';
            } else {
                const cellDate = new Date(year, month, dayCounter);
                const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();
                calendarHTML += `<td class="calendar-cell ${isSelected ? 'selected' : ''}" data-date="${cellDate.toISOString()}">${dayCounter}</td>`;
                dayCounter++;
            }

            if ((i + 1) % 7 === 0) {
                calendarHTML += '</tr><tr>';
            }
        }

        calendarHTML += '</tr></table>';
        calendar.innerHTML = calendarHTML;
        monthDisplay.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
    }

    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });

    calendar.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('calendar-cell')) {
            const selectedCell = calendar.querySelector('.selected');
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
            selectedDate = new Date(target.dataset.date);
            target.classList.add('selected');
        }
    });

    generateCalendar(currentDate);
})