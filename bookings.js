let bookings = [];
let jobs = [];

// ================= LOAD BOOKINGS =================
async function loadBookings() {
    try {

        const res = await fetch(API + "/bookings?test=" + Date.now());

        if (!res.ok) {
            return;
        }

        const data = await res.json();

        bookings = data;
window.bookings = data;

        let todayHtml = "";

        const today = new Date().toLocaleDateString("en-CA");

        data.forEach(b => {
            const c = b.customer || {};
            const v = b.vehicle || {};

            const card = `
<div class="card" onclick="openBooking('${b._id}')">
    <div class="title">Booking</div>
    <b>${b.customerName || "No Customer"}</b><br>
    ${b.vehicle || ""}<br><br>
                ${
                    (b.services || []).map(s => `
                        <div>• ${s}</div>
                    `).join("")
                }
            </div>`;

            const bookingDate = new Date(b.date).toLocaleDateString("en-CA");

            if (bookingDate === today) {
                todayHtml += card;
            }
        });

        document.getElementById("todayList").innerHTML =
            todayHtml || "<div class='card'>No bookings today</div>";

        document.getElementById("futureList").innerHTML = "";

      setTimeout(() => {
    if (typeof renderCalendar === "function") {
        renderCalendar();
    }
}, 0);

    } catch (err) {
        console.error(err);
    }
}
// ================= OPEN BOOKING =================
async function openBooking(id) {

    const booking = bookings.find(b => b._id === id);

alert(JSON.stringify(booking));

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("bookingCard").classList.add("active");

    currentJob = {
    _id: booking._id,

    customer: booking.customer || null,
    vehicle: booking.vehicle || null,

    title: booking.title,
    customerName: booking.customerName || "",
    phone: booking.phone || "",
    rego: booking.rego || "",

    vehicleName:
        booking.vehicleName ||
        (
            booking.vehicle && typeof booking.vehicle === "object"
                ? ((booking.vehicle.make || "") + " " + (booking.vehicle.model || "")).trim()
                : ""
        ),

    description: booking.description || "",
    services: booking.services || booking.summaries || []
};

    renderBookingCard();
}

// ================= RENDER =================
function renderBookingCard() {

    document.getElementById("bookingCardInfo").innerHTML = `
<div class="card">
    <b>Status:</b> BOOKING<br>
    <b>Customer:</b> ${currentJob.customerName || ""}<br>
    <b>Phone:</b> ${currentJob.phone || ""}<br>
    <b>Rego:</b> ${currentJob.rego || ""}<br>
    <b>Vehicle:</b> ${currentJob.vehicleName || ""}
</div>

  <div class="card">
    <div class="title">Jobs</div>
    ${
        (() => {
            const services = currentJob.services || [];
            const descriptions = (currentJob.description || "").split("\n");

            return services.map((s, i) => `
<div style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
    <b>Job ${i + 1}</b><br>
    <b>${s || "No Title"}</b><br>
    <small style="color:#777;">
        ${descriptions[i] || "No Description"}
    </small>

    <br><br>

    <button class="secondary" onclick="editBookingJob(${i})">Edit</button>
    <button class="secondary" onclick="deleteBookingJob(${i})">Delete</button>
</div>
`).join("");
        })()
    }
</div>
`;

    document.getElementById("bookingCardActions").innerHTML = `
    <button class="primary" onclick="addBookingJob()">+ Add Job</button>
    <button class="primary" onclick="arrivedBooking('${currentJob._id}')">Arrived</button>
    <button class="secondary" onclick="deleteBooking('${currentJob._id}')">Delete</button>
    <button class="secondary" onclick="show('bookings')">Back</button>
`;
}

// ================= ARRIVED =================
async function arrivedBooking(id) {

const descriptions = (currentJob.description || "").split("\n");

    const jobRes = await fetch(API + "/jobs", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
    title: "Job Card",

    customer: currentJob.customer || null,
    vehicle: currentJob.vehicle || null,

    customerName: currentJob.customerName || "",
phone: currentJob.phone || "",
rego: currentJob.rego || "",
vehicleName: currentJob.vehicleName || "",

    jobs: (currentJob.services || []).map((s, i) => ({
        summary: s,
        description: descriptions[i] || ""
    })),

    status: "arrived"
})
    });

    const job = await jobRes.json();

    await fetch(API + "/bookings/" + id, { method:"DELETE" });

    show('jobs');
    loadJobs();
}

// ================= DELETE =================
async function deleteBooking(id) {
    await fetch(API + "/bookings/" + id, { method:"DELETE" });
    show('bookings');
    loadBookings();
}

// ================= MODAL =================
function openBookingModal(date = null) {
    document.getElementById("bookingModal").style.display = "block";

    jobs = [];
    
    document.getElementById("jobsContainer").innerHTML = "";

    document.getElementById("displayFirstName").value = "";
    document.getElementById("displayLastName").value = "";
    document.getElementById("displayPhone").value = "";
    document.getElementById("displayRego").value = "";
    document.getElementById("displayMake").value = "";
document.getElementById("displayModel").value = "";
document.getElementById("displayBuildDate").value = "";

    document.getElementById("bookingDate").value =
        date || new Date().toISOString().split("T")[0];

    addJob();
}
function closeBookingModal() {
    document.getElementById("bookingModal").style.display = "none";
}


// ================= CREATE BOOKING =================
async function confirmBooking() {

    if (!jobs.length) {
        return;
    }

    const bookingDate = document.getElementById("bookingDate").value;
    const duration = parseFloat(document.getElementById("bookingDuration").value) || 1;

    if (!bookingDate) {
        return;
    }

    const rego = document.getElementById("displayRego").value || "";
const vehicle =
(
    (document.getElementById("displayMake").value || "") + " " +
    (document.getElementById("displayModel").value || "")
).trim();

let matchedCustomer = null;

try {

    const cRes = await fetch(API + "/customers");
    const customers = await cRes.json();

    const vRes = await fetch(API + "/vehicles");
    const vehicles = await vRes.json();

    let matchedVehicle = vehicles.find(v =>
    (v.rego || "").toLowerCase().trim() === rego.toLowerCase().trim()
);

alert(JSON.stringify(matchedVehicle));

if (matchedVehicle) {

        matchedCustomer = customers.find(c =>
            (c._id || "").toString() ===
            ((matchedVehicle.customer?._id || matchedVehicle.customer || "").toString())
        );

        if (matchedCustomer) {

            document.getElementById("displayFirstName").value =
                matchedCustomer.firstName || "";

            document.getElementById("displayLastName").value =
                matchedCustomer.lastName || "";

            document.getElementById("displayPhone").value =
                matchedCustomer.phone || "";
        }
    }

const customerName =
(
    (document.getElementById("displayFirstName").value || "") + " " +
    (document.getElementById("displayLastName").value || "")
).trim();

const phone = document.getElementById("displayPhone").value || "";

const res = await fetch(API + "/bookings", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
    title: jobs[0]?.summary || "Booking",

    customer: matchedCustomer || null,
vehicle: matchedVehicle || null,

    customerName,
    phone,
    rego,
    vehicleName: vehicle,

    description: jobs.map(j => j.description).join("\n"),

    services: jobs.map(j => j.summary || "")
        .filter(s => s.trim() !== ""),

    status: "booked",
    date: bookingDate,
    duration: duration
})
});

    if (!res.ok) {
        return;
    }

} catch (err) {
    return;
}

    closeBookingModal();
    show('bookings');
    loadBookings();
}

// ================= JOB UI =================
function addJob() {
    jobs.push({ mode: null, summary: "", description: "" });
    renderJobs();
}

function setJobMode(i, mode) {
    window.selectedJobIndex = i;
    jobs[i].mode = mode;
    renderJobs();
}

function updateJobField(i, field, value) {
    jobs[i][field] = value;
}

function renderJobs() {

    let html = "";

    jobs.forEach((job, i) => {

        html += `
        <div class="card">
            <div class="title">Job ${i + 1}</div>

            <input placeholder="Summary" value="${job.summary || ""}"
                oninput="updateJobField(${i}, 'summary', this.value)">

            <input placeholder="Description" value="${job.description || ""}"
                oninput="updateJobField(${i}, 'description', this.value)">

        </div>
        `;
    });

    document.getElementById("jobsContainer").innerHTML = html;
}

let selectedDate = null;

function deleteBookingJob(i) {

    if (!confirm("Delete this job?")) return;

    // remove from services
    currentJob.services.splice(i, 1);

    // remove matching description
    const descriptions = (currentJob.description || "").split("\n");
    descriptions.splice(i, 1);
    currentJob.description = descriptions.join("\n");

    // re-render UI
    renderBookingCard();
}

function addBookingJob() {

    // add empty job
    currentJob.services.push("New Job");

    // add matching description line
    const descriptions = (currentJob.description || "").split("\n");
    descriptions.push("");
    currentJob.description = descriptions.join("\n");

    // refresh UI
    renderBookingCard();
}

function editBookingJob(i) {

    const newSummary = prompt("Edit job summary:", currentJob.services[i]);
    if (newSummary === null) return;

    const descriptions = (currentJob.description || "").split("\n");
    const newDesc = prompt("Edit description:", descriptions[i] || "");

    currentJob.services[i] = newSummary;
    descriptions[i] = newDesc || "";
    currentJob.description = descriptions.join("\n");

    renderBookingCard();
}

function createFromSelectedDay() {
    if (!selectedDate) return;

    openBookingModal(selectedDate);
}