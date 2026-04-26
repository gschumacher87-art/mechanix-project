alert("CALENDAR FILE LOADED");
// ================= CALENDAR STATE =================
let currentMonth = new Date();
let selectedDate = null;

// ================= GROUP BOOKINGS =================
function groupBookingsByDate() {
    const map = {};

    bookings.forEach(b => {
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
        html += `<div class="card" style="visibility:hidden;"></div>`;
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
<div class="card"
onclick="selectCalendarDate('${dateStr}')"
style="height:100px; overflow:hidden;
background:${bg};
${dateStr === today ? 'border:2px solid #007bff;' : ''}
${dateStr === selectedDate ? 'outline:2px solid #007bff;' : ''}">
            
            <div><b>${d}</b></div>

            <div style="margin-top:4px;">
                ${
                    (() => {
                        const visible = dayBookings.slice(0, 3);
                        const extra = dayBookings.length - visible.length;

                        return `
                            ${visible.map(b => `
<div 
    style="font-size:10px; background:#ffe3e3; margin:2px 0; padding:2px; border-radius:3px;"
    onclick="event.stopPropagation(); openBooking('${b._id}')"
>
    ${b.customer?.firstName || "No"} 
    ${b.customer?.lastName || ""}
    <br>
    <small>${(b.services || []).join(", ")}</small>
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
    selectedDate = date;
    openBookingModal(date);
}

// ================= CHANGE MONTH =================
function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}
window.renderCalendar = renderCalendar;