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

<div style='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px;'>

<div style="font-weight:bold;text-align:center;">Mon</div>
<div style="font-weight:bold;text-align:center;">Tue</div>
<div style="font-weight:bold;text-align:center;">Wed</div>
<div style="font-weight:bold;text-align:center;">Thu</div>
<div style="font-weight:bold;text-align:center;">Fri</div>
<div style="font-weight:bold;text-align:center;">Sat</div>
<div style="font-weight:bold;text-align:center;">Sun</div>

</div>

<div style='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;'>
`;

    for (let i = 0; i < firstDay; i++) {
        html += `<div style="visibility:hidden;"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {

        const dateStr = new Date(year, month, d).toLocaleDateString("en-CA");
        const dayBookings = grouped[dateStr] || [];

        const capacityPerDay = 10;

        const totalHours = dayBookings.reduce((sum, b) => {
            return sum + ((b.services || []).length || 1);
        }, 0);

        const load = totalHours / capacityPerDay;

        let bg = "#e9ecef";
        if (load > 0.9) bg = "#ff6b6b";
        else if (load > 0.7) bg = "#ffa94d";
        else if (load > 0.4) bg = "#ffd43b";
        else bg = "#69db7c";

        html += `
<div
onclick="selectCalendarDate('${dateStr}')"
style="
height:90px;
padding:6px;
border-radius:8px;
background:${bg};
position:relative;
overflow:hidden;
${dateStr === today ? 'border:2px solid #007bff;' : ''}
${dateStr === window.selectedDate ? 'outline:2px solid #007bff;' : ''}
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
        padding:3px 5px;
        border-radius:4px;
        line-height:1.2;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
    "
>
    ${b.customer?.firstName || "No"} ${b.customer?.lastName || ""}
</div>
`).join("")}

                            ${extra > 0 ? `
                                <div style="font-size:10px; color:#666;">
                                    +${extra} more
                                </div>
                            ` : ""}
                        `;
                    })()
                }
            </div>

        </div>`;
    }

    html += "</div>";

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