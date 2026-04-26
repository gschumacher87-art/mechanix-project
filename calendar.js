// ================= CALENDAR STATE =================
let currentMonth = new Date();
window.selectedDate = window.selectedDate || null;

// ================= GROUP BOOKINGS =================
function groupBookingsByDate() {
    const map = {};

    (window.bookings || []).forEach(b => {
        const date = (b.date || "").split("T")[0];
        if (!map[date]) map[date] = [];
        map[date].push(b);
    });

    return map;
}

// ================= RENDER CALENDAR =================
function renderCalendar() {

    const el = document.getElementById("calendar");
    if (!el) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = (firstDay === 0 ? 6 : firstDay - 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = currentMonth.toLocaleString("default", { month: "long" });
    const grouped = groupBookingsByDate();
    const today = new Date().toLocaleDateString("en-CA");

    let html = `
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
    <button onclick="changeMonth(-1)">←</button>
    <b>${monthName} ${year}</b>
    <button onclick="changeMonth(1)">→</button>
</div>

<div style="
display:grid;
grid-template-columns:repeat(7,1fr);
border:1px solid #ccc;
">

${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => `
<div style="
text-align:center;
font-weight:bold;
padding:6px;
border:1px solid #ccc;
background:#f1f3f5;
">
${d}
</div>
`).join("")}
`;

    const totalCells = 42; // 6 rows x 7 days
    let dayCounter = 1;

    for (let i = 0; i < totalCells; i++) {

        const isEmpty = i < firstDay || dayCounter > daysInMonth;

        if (isEmpty) {
            html += `<div style="border:1px solid #eee; height:100px; background:#f8f9fa;"></div>`;
            continue;
        }

        const d = dayCounter;
        const dateStr = new Date(year, month, d).toLocaleDateString("en-CA");
        const dayBookings = grouped[dateStr] || [];

        const totalHours = dayBookings.reduce((sum, b) => {
    return sum + (b.duration || 1);
}, 0);

let bg = "#69db7c"; // green

if (totalHours >= 7) {
    bg = "#ff6b6b"; // red
} else if (totalHours >= 5) {
    bg = "#ffa94d"; // orange
}

        html += `
<div
onclick="selectCalendarDate('${dateStr}')"
style="
border:1px solid #ddd;
height:100px;
padding:6px;
display:flex;
flex-direction:column;
background:${bg};
overflow:hidden;
cursor:pointer;
${dateStr === today ? 'outline:2px solid #007bff;' : ''}
${dateStr === window.selectedDate ? 'outline:2px solid #000;' : ''}
">

<div style="font-size:12px; font-weight:600;">${d}</div>

<div style="margin-top:4px; display:flex; flex-direction:column; gap:2px;">
${
(() => {
    const visible = dayBookings.slice(0, 3);
    const extra = dayBookings.length - visible.length;

    return `
        ${visible.map(b => `
<div 
onclick="event.stopPropagation(); openBooking('${b._id}')"
style="
font-size:10px;
background:#ffffffcc;
padding:2px 4px;
border-radius:3px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
">
${b.customer?.firstName || "No"} ${b.customer?.lastName || ""}
</div>
`).join("")}

        ${extra > 0 ? `<div style="font-size:10px; color:#666;">+${extra} more</div>` : ""}
    `;
})()
}
</div>

</div>
`;

        dayCounter++;
    }

    html += `</div>`;

    el.innerHTML = html;
}



// ================= SELECT DATE =================
function selectCalendarDate(date) {
    window.selectedDate = date;
    openBookingModal(date);
}

// ================= CHANGE MONTH =================
function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}

// ================= EXPORT =================
window.renderCalendar = renderCalendar;
window.changeMonth = changeMonth;
window.selectCalendarDate = selectCalendarDate;