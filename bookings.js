let bookings = [];

async function loadBookings() {
    const res = await fetch(API + "/bookings");
    bookings = await res.json();

    let todayHtml = "";
    const today = new Date().toLocaleDateString("en-CA");

    bookings.forEach(b => {
        const d = new Date(b.date).toLocaleDateString("en-CA");

        if (d === today) {
            todayHtml += `
            <div class="card">
                ${b.customer?.firstName || ""} ${b.customer?.lastName || ""}
            </div>`;
        }
    });

    document.getElementById("todayList").innerHTML =
        todayHtml || "<div class='card'>No bookings</div>";
}

loadBookings();

function openBookingModal(date = null) {
    document.getElementById("bookingModal").style.display = "block";

    document.getElementById("bookingDate").value =
        date || new Date().toISOString().split("T")[0];
}