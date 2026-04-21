let bookings = [];
let selectedCustomerId = null;
let jobs = [];
let currentMonth = new Date();

// ================= LOAD BOOKINGS =================
async function loadBookings() {
    const res = await fetch(API + "/bookings?test=" + Date.now(), {
        headers: {
            Authorization: localStorage.getItem("token")
        }
    });
    const data = await res.json();

    bookings = data;

    let todayHtml = "";
    let futureHtml = "";

    const today = new Date().toLocaleDateString("en-CA");

    data.forEach(b => {
        const c = b.customer || {};
        const v = b.vehicle || {};

        const card = `
        <div class="card" onclick="openBooking('${b._id}')">
            <div class="title">Booking</div>
            <b>${c.firstName || "No"} ${c.lastName || "Customer"}</b><br>
            ${v.make || ""} ${v.model || ""}<br><br>
            ${
                (b.jobs || []).map(j => `
    <div>• ${j.summary}</div>
`).join("")
            }
        </div>`;

        const bookingDate = (b.date || "").split("T")[0];

        if (bookingDate === today) {
            todayHtml += card;
        } else {
            futureHtml += card;
        }
    });

    document.getElementById("todayList").innerHTML =
        todayHtml || "<div class='card'>No bookings today</div>";

    document.getElementById("futureList").innerHTML =
        futureHtml || "<div class='card'>No future bookings</div>";

    renderCalendar();
}

// ================= OPEN BOOKING =================
// ================= OPEN BOOKING =================
async function openBooking(id) {

    const booking = bookings.find(b => b._id === id);

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("jobCard").classList.add("active");

    currentJob = {
        _id: booking._id,
        title: booking.title,
        customer: booking.customer || {},
        vehicle: booking.vehicle || {},
        services: booking.jobs || []
    };

    
// ================= RENDER =================
function renderBookingCard() {

    const c = currentJob.customer || {};
    const v = currentJob.vehicle || {};

    document.getElementById("jobCardInfo").innerHTML = `
    <div class="card">
        <b>Status:</b> BOOKING<br>
        <b>Customer:</b> ${c.firstName || ""} ${c.lastName || ""}<br>
        <b>Vehicle:</b> ${v.make || ""} ${v.model || ""}
    </div>

  <div class="card">
    <div class="title">Jobs</div>
    ${
        (() => {
            const services = currentJob.services || [];

return services.map((s, i) => `
<div style="margin-bottom:15px;">
    <b>Job ${i + 1}</b><br>
    <b>${s}</b>
</div>
`).join("");
        })()
    }
</div>
`;

    document.getElementById("jobCardChecklist").innerHTML = "";

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
title: "Job Card",
jobs: booking.jobs || [],
customer: booking.customer?._id || booking.customer,
vehicle: booking.vehicle?._id || booking.vehicle,
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
function openBookingModal() {
    document.getElementById("bookingModal").style.display = "block";

    selectedCustomerId = null;
    jobs = [];

    document.getElementById("bookingVehicle").innerHTML = "";
    document.getElementById("displayFirstName").value = "";
    document.getElementById("displayLastName").value = "";
    document.getElementById("displayPhone").value = "";
    document.getElementById("displayRego").value = "";

    document.getElementById("bookingDate").value =
        new Date().toLocaleDateString("en-CA");

    addJob();
}

function closeBookingModal() {
    document.getElementById("bookingModal").style.display = "none";
}

// ================= 🔥 BOOKING SEARCH (NEW, INDEPENDENT) =================
async function bookingSearchCustomers() {

    const first = (document.getElementById("searchFirstName").value || "").toLowerCase();
    const last = (document.getElementById("searchLastName").value || "").toLowerCase();
    const phone = document.getElementById("searchPhone").value || "";
    const rego = (document.getElementById("searchRego").value || "").toLowerCase();

    const res = await fetch(API + "/customers");
    const customers = await res.json();

    const vRes = await fetch(API + "/vehicles");
    const vehicles = await vRes.json();

    let html = "";

    customers.forEach(c => {

        const cFirst = (c.firstName || "").toLowerCase();
        const cLast = (c.lastName || "").toLowerCase();
        const cPhone = c.phone || "";

        const matchCustomer =
            (!first || cFirst.includes(first)) &&
            (!last || cLast.includes(last)) &&
            (!phone || cPhone.includes(phone));

        let matchVehicle = false;

        if (rego) {
            const v = vehicles.find(v =>
                v.customer && (v.customer._id || v.customer).toString() === c._id.toString() &&
                (v.rego || "").toLowerCase().includes(rego)
            );
            if (v) matchVehicle = true;
        }

        if (matchCustomer || matchVehicle) {

            const customerVehicles = vehicles.filter(v =>
                v.customer && (v.customer._id || v.customer).toString() === c._id.toString()
            );

            let vehicleLine = "";

            if (customerVehicles.length) {
                const v = customerVehicles[0];
                vehicleLine = `<br><small>${v.make || ""} ${v.model || ""} (${v.rego || ""})</small>`;
            }

            html += `
            <div class="card" onclick="selectCustomerFromPopup('${c._id}')">
                <b>${c.firstName} ${c.lastName}</b><br>
                ${c.phone}
                ${vehicleLine}
            </div>`;
        }
    });

    document.getElementById("customerPopupList").innerHTML =
        html || `
        <div class='card'>No matches</div>
        <button class="primary" onclick="openCreateCustomer()">Create New Customer</button>
        `;

    document.getElementById("customerPopup").style.display = "block";
}
// ================= SELECT CUSTOMER =================
async function selectCustomer(id) {

    selectedCustomerId = id;

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    document.getElementById("displayFirstName").value = customer.firstName || "";
    document.getElementById("displayLastName").value = customer.lastName || "";
    document.getElementById("displayPhone").value = customer.phone || "";

    const vRes = await fetch(API + "/vehicles?customer=" + id);
    const vehicles = await vRes.json();

    if (vehicles.length) {
        document.getElementById("displayRego").value = vehicles[0].rego || "";
    } else {
        document.getElementById("displayRego").value = "";
    }

    let options = `<option value="">Select vehicle</option>`;

    vehicles.forEach(v => {
        options += `<option value="${v._id}">${v.make} ${v.model}</option>`;
    });

    document.getElementById("bookingVehicle").innerHTML = options;
    document.getElementById("bookingVehicle").value = vehicles[0]?._id || "";
}
window.selectCustomer = selectCustomer;

function closeCustomerPopup() {
    document.getElementById("customerPopup").style.display = "none";
}

function openCreateCustomer() {
    closeCustomerPopup();
    document.getElementById("createCustomerModal").style.display = "block";
}

async function createCustomer() {

    const first = document.getElementById("newFirstName").value.trim();
    const last = document.getElementById("newLastName").value.trim();
    const phone = document.getElementById("newPhone").value.trim();

    const make = document.getElementById("newMake").value.trim();
    const model = document.getElementById("newModel").value.trim();
    const rego = document.getElementById("newRego").value.trim();

    if (!phone) {
        alert("Phone required");
        return;
    }

    if (!first && !last) {
        alert("First or Last required");
        return;
    }

    if (!make && !model && !rego) {
        alert("Vehicle info required");
        return;
    }

    const res = await fetch(API + "/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: first,
            lastName: last,
            phone: phone
        })
    });

    const customer = await res.json();

    if (!res.ok) {
        alert("Customer failed");
        return;
    }

    const vRes = await fetch(API + "/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            customer: customer._id,
            make,
            model,
            rego
        })
    });

    const vehicle = await vRes.json();

    if (!vRes.ok) {
        alert("Vehicle failed");
        return;
    }

    await selectCustomer(customer._id);

    document.getElementById("createCustomerModal").style.display = "none";
    closeCustomerPopup();
}

async function selectCustomerFromPopup(id) {

    closeCustomerPopup();

    await selectCustomer(id);
}

// ================= CREATE BOOKING =================
// ================= CREATE BOOKING =================
async function confirmBooking() {

    if (!selectedCustomerId) {
        return;
    }

    if (!jobs.length) {
        return;
    }

    const vehicleId = document.getElementById("bookingVehicle").value;
    const bookingDate = document.getElementById("bookingDate").value;

    if (!bookingDate) {
        return;
    }

    if (!vehicleId) {
        return;
    }

    const res = await fetch(API + "/bookings", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            title: jobs[0]?.summary || "Booking",
            jobs: jobs,
            customer: selectedCustomerId,
            vehicle: vehicleId,
            status: "booked",
            date: bookingDate
        })
    });

    const data = await res.json();

    if (!res.ok) {
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

            <button onclick="openTemplatePopup(${i})">Use Template</button>
        </div>
        `;
    });

    document.getElementById("jobsContainer").innerHTML = html;
}

function generateChecklistFromServices(services) {

    let tasks = [];

    services.forEach(s => {

        const name = (s || "").toLowerCase();

        if (name.includes("service")) {
            tasks.push(
                { text: "Oil change", done: false },
                { text: "Replace oil filter", done: false },
                { text: "General inspection", done: false }
            );
        }

        else if (name.includes("brake")) {
            tasks.push(
                { text: "Inspect brakes", done: false },
                { text: "Replace brake pads", done: false }
            );
        }

        else if (name.includes("diagnose")) {
            tasks.push(
                { text: "Initial inspection", done: false },
                { text: "Run diagnostics", done: false }
            );
        }

        else {
            tasks.push({ text: s, done: false });
        }

    });

    return tasks;
}

function openBookingCustomerSearch() {
    bookingSearchCustomers();
}

function renderCalendar() {

    const el = document.getElementById("calendar");
    if (!el) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date().toLocaleDateString("en-CA");

    const monthName = currentMonth.toLocaleString("default", { month: "long" });

    let html = `
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
    <button onclick="changeMonth(-1)">←</button>
    <b>${monthName} ${year}</b>
    <button onclick="changeMonth(1)">→</button>
</div>

<div style='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;'>
`;

    for (let i = 0; i < firstDay; i++) {
        html += "<div></div>";
    }

    for (let d = 1; d <= daysInMonth; d++) {

        const dateStr = new Date(year, month, d).toLocaleDateString("en-CA");

        const hasBooking = bookings.some(b =>
            (b.date || "").split("T")[0] === dateStr
        );

        html += `
        <div class="card"
            onclick="selectCalendarDate('${dateStr}')"
            style="${dateStr === today ? 'border:2px solid #007bff;' : ''}">
            
            <div>${d}</div>
            ${hasBooking ? "<div style='font-size:10px;color:#28a745;'>•</div>" : ""}
        </div>`;
    }

    html += "</div>";

    el.innerHTML = html;
}

function selectCalendarDate(date) {
    openBookingModal();
    document.getElementById("bookingDate").value = date;
}

function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}

function openTemplatePopup(i) {
    window.selectedJobIndex = i;
    document.getElementById("templateModal").style.display = "block";
    loadTemplates();
}