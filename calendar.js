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
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
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
padding:8px;
text-align:center;
font-weight:600;
border-bottom:1px solid #ccc;
background:#f1f3f5;
">
${d}
</div>
`).join("")}
`;

    // empty cells before month start
    for (let i = 0; i < firstDay; i++) {
        html += `<div style="border:1px solid #eee; height:110px; background:#fafafa;"></div>`;
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
border:1px solid #eee;
height:110px;
padding:6px;
display:flex;
flex-direction:column;
background:${bg};
position:relative;
cursor:pointer;
${dateStr === today ? 'outline:2px solid #007bff;' : ''}
${dateStr === window.selectedDate ? 'outline:2px solid #000;' : ''}
">

    <div style="
    font-size:12px;
    font-weight:600;
    margin-bottom:4px;
    ">
        ${d}
    </div>

    <div style="
    flex:1;
    display:flex;
    flex-direction:column;
    gap:2px;
    overflow:hidden;
    ">
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
background:#ffffffdd;
padding:2px 4px;
border-radius:3px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
">
${b.customer?.firstName || "No"} ${b.customer?.lastName || ""}
</div>
`).join("")}

                    ${extra > 0 ? `
<div style="font-size:10px; color:#333;">
+${extra} more
</div>
` : ""}
                `;
            })()
        }
    </div>

</div>`;
    }

    html += `</div>`;

    el.innerHTML = html;
}