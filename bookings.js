let bookings = [];
let selectedCustomerId = null;
let jobs = [];

// ================= LOAD BOOKINGS =================
async function loadBookings() {
    const res = await fetch(API + "/bookings");
    const data = await res.json();

    bookings = data;

    let html = "";

    data.forEach(b => {

        const c = b.customer || {};
        const v = b.vehicle || {};

        html += `
        <div class="card" onclick="openBooking('${b._id}')">
            <div class="title">${b.title || "Booking"}</div>
            <b>${c.firstName || "No"} ${c.lastName || "Customer"}</b><br>
            ${v.make || ""} ${v.model || ""}
        </div>`;
    });

    document.getElementById("bookingList").innerHTML =
        html || "<div class='card'>No bookings</div>";
}

// ================= OPEN BOOKING =================
async function openBooking(id) {

    const res = await fetch(API + "/bookings/" + id);
    const booking = await res.json();

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("jobCard").classList.add("active");

    currentJob = {
        _id: booking._id,
        title: booking.title,
        customer: booking.customer || {},
        vehicle: booking.vehicle || {},
        checklist: booking.checklist || []
    };

    renderBookingCard();
}

// ================= RENDER =================
function renderBookingCard() {

    const c = currentJob.customer || {};
    const v = currentJob.vehicle || {};

    let checklistHtml = "";

    (currentJob.checklist || []).forEach(item => {
        checklistHtml += `
        <div style="display:flex; gap:10px; margin-bottom:6px;">
            <input type="checkbox" ${item.done ? "checked" : ""}>
            <span>${item.text}</span>
        </div>`;
    });

    document.getElementById("jobCardInfo").innerHTML = `
        <div class="card">
            <div class="title">${currentJob.title}</div>
            <b>Status:</b> BOOKING<br>
            <b>Customer:</b> ${c.firstName || ""} ${c.lastName || ""}<br>
            <b>Vehicle:</b> ${v.make || ""} ${v.model || ""}
        </div>
    `;

    document.getElementById("jobCardChecklist").innerHTML =
        checklistHtml || "<div style='color:#777;'>No tasks</div>";

    document.getElementById("jobCardActions").innerHTML = `
        <button class="primary" onclick="arrivedBooking('${currentJob._id}')">Arrived</button>
        <button class="secondary" onclick="deleteBooking('${currentJob._id}')">Delete</button>
        <button class="secondary" onclick="show('bookings')">Back</button>
    `;
}

// ================= ARRIVED =================
async function arrivedBooking(id) {

    const res = await fetch(API + "/bookings/" + id);
    const booking = await res.json();

    const jobRes = await fetch(API + "/jobs", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            title: booking.title,
            customer: booking.customer?._id || booking.customer,
            vehicle: booking.vehicle?._id || booking.vehicle,
            status: "in-progress",
            checklist: booking.checklist || []
        })
    });

    const job = await jobRes.json();

    await fetch(API + "/bookings/" + id, { method:"DELETE" });

    openJobCard(job._id);
}

// ================= DELETE =================
async function deleteBooking(id) {
    await fetch(API + "/bookings/" + id, { method:"DELETE" });
    show('bookings');
    loadBookings();
}

// ================= MODAL =================
function openBookingModal() {
    document.getElementById("bookingModal").style.display = "block";

    selectedCustomerId = null;
    jobs = [];

    document.getElementById("bookingStepSearch").style.display = "block";
    document.getElementById("bookingStepResults").style.display = "none";
    document.getElementById("bookingStepDetails").style.display = "none";

    document.getElementById("selectedCustomer").innerHTML = "";
    document.getElementById("bookingVehicle").innerHTML = "";

    addJob();
}

function closeBookingModal() {
    document.getElementById("bookingModal").style.display = "none";
}

// ================= SELECT CUSTOMER =================
async function selectCustomer(id) {

    selectedCustomerId = id;

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    document.getElementById("bookingStepSearch").style.display = "none";
    document.getElementById("bookingStepResults").style.display = "none";
    document.getElementById("bookingStepDetails").style.display = "block";

    document.getElementById("selectedCustomer").innerHTML = `
        <b>${customer.firstName} ${customer.lastName}</b><br>
        ${customer.phone}
    `;

    // ✅ CORRECT: backend filter
    const vRes = await fetch(API + "/vehicles?customer=" + id);
    const vehicles = await vRes.json();

    let options = `<option value="">Select vehicle</option>`;

    vehicles.forEach(v => {
        options += `<option value="${v._id}">${v.make} ${v.model}</option>`;
    });

    document.getElementById("bookingVehicle").innerHTML = options;
}

// ================= CREATE BOOKING =================
async function confirmBooking() {

    if (!selectedCustomerId) {
        alert("Select customer");
        return;
    }

    if (!jobs.length || !jobs[0].mode) {
        alert("Add job");
        return;
    }

    const vehicleId = document.getElementById("bookingVehicle").value;

    if (!vehicleId) {
        alert("Select vehicle");
        return;
    }

    const res = await fetch(API + "/bookings", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            title: jobs[0].description || "Booking",
            customer: selectedCustomerId,
            vehicle: vehicleId,
            status: "booked",
            checklist: []
        })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Booking failed");
        return;
    }

    closeBookingModal();
    show('bookings');
    loadBookings();
}

// ================= JOB UI =================
function addJob() {
    jobs.push({ mode: null, description: "" });
    renderJobs();
}

function setJobMode(i, mode) {
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

            ${!job.mode ? `
                <button onclick="setJobMode(${i}, 'manual')">Manual</button>
            ` : ""}

            ${job.mode === "manual" ? `
                <input placeholder="Description"
                    oninput="updateJobField(${i}, 'description', this.value)">
            ` : ""}
        </div>
        `;
    });

    document.getElementById("jobsContainer").innerHTML = html;
}