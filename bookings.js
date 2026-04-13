let bookings = [];

async function loadBookings() {
    const res = await fetch(API + "/bookings");
    const data = await res.json();

    bookings = data;

    let html = "";

    data.forEach(b => {
        html += `
        <div class="card" onclick="openBooking('${b._id}')">
            <div class="title">${b.title}</div>
            <b>${b.customer?.firstName || ""} ${b.customer?.lastName || ""}</b><br>
            ${b.vehicle?.make || ""} ${b.vehicle?.model || ""}
        </div>`;
    });

    bookingList.innerHTML = html || "<div class='card'>No bookings</div>";
}

async function openBooking(id) {

    const res = await fetch(API + "/bookings/" + id);
    const booking = await res.json();

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("jobCard").classList.add("active");

    currentJob = {
        _id: booking._id,
        isBooking: true,
        title: booking.title,
        customer: booking.customer,
        vehicle: booking.vehicle,
        status: booking.status,
        checklist: booking.checklist || []
    };

    renderBookingCard();
}

function renderBookingCard() {

    let checklistHtml = "";

    currentJob.checklist ??= [];

    currentJob.checklist.forEach((item, i) => {
        checklistHtml += `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <input type="checkbox" ${item.done ? "checked" : ""}>
            <span>${item.text}</span>
        </div>`;
    });

    document.getElementById("jobCardInfo").innerHTML = `
        <div class="card">
            <div class="title">${currentJob.title}</div>
            <b>Status:</b> BOOKING<br>
            <b>Customer:</b> ${currentJob.customer?.firstName || ""} ${currentJob.customer?.lastName || ""}<br>
            <b>Vehicle:</b> ${currentJob.vehicle?.make || ""} ${currentJob.vehicle?.model || ""}
        </div>
    `;

    document.getElementById("jobCardChecklist").innerHTML = `
        ${checklistHtml || "<div style='color:#777;'>No tasks</div>"}
    `;

    document.getElementById("jobCardActions").innerHTML = `
    <button class="primary" onclick="arrivedBooking('${currentJob._id}')">Arrived</button>
    <button class="secondary" onclick="rebookBooking()">Rebook</button>
    <button class="secondary" onclick="deleteBooking('${currentJob._id}')">Delete Booking</button>
    <button class="secondary" onclick="show('bookings')">Back</button>
    `;
}

async function convertBooking(id) {

    const res = await fetch(API + "/bookings/" + id);
    const booking = await res.json();

    const jobRes = await fetch(API + "/jobs", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            title: booking.title,
            customer: booking.customer,
            vehicle: booking.vehicle,
            status: "booked",
            checklist: booking.checklist || []
        })
    });

    const job = await jobRes.json();

    await fetch(API + "/bookings/" + id, {
        method:"DELETE"
    });

    openJobCard(job._id);
}

function openBookingModal() {
    document.getElementById("bookingModal").style.display = "block";

    jobs = [];
    addJob();
}

function closeBookingModal() {
    document.getElementById("bookingModal").style.display = "none";
}

async function arrivedBooking(id) {

    const res = await fetch(API + "/bookings/" + id);
    const booking = await res.json();

    const jobRes = await fetch(API + "/jobs", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            title: booking.title,
            customer: booking.customer,
            vehicle: booking.vehicle,
            status: "in-progress",
            checklist: booking.checklist || []
        })
    });

    const job = await jobRes.json();

    await fetch(API + "/bookings/" + id, {
        method:"DELETE"
    });

    openJobCard(job._id);
}

function rebookBooking() {
    alert("Rebook coming later");
}

async function deleteBooking(id) {

    await fetch(API + "/bookings/" + id, {
        method:"DELETE"
    });

    show('bookings');
    loadBookings();
}

// ================= BOOKING CREATION FLOW =================

let selectedCustomerId = null;

async function selectCustomer(id) {

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    document.getElementById("bookingStepSearch").style.display = "none";
    document.getElementById("bookingStepResults").style.display = "none";
    document.getElementById("bookingStepDetails").style.display = "block";

    selectedCustomerId = customer._id;

    document.getElementById("selectedCustomer").innerHTML = `
        <b>${customer.firstName} ${customer.lastName}</b><br>
        ${customer.phone}
    `;

    const vRes = await fetch(API + "/vehicles");
    const vehicles = await vRes.json();

    let options = "";

    vehicles
        .filter(v => v.customer === id)
        .forEach(v => {
            options += `<option value="${v._id}">${v.make} ${v.model}</option>`;
        });

    document.getElementById("bookingVehicle").innerHTML = options;
}

async function confirmBooking() {

    if (!selectedCustomerId) {
        alert("Select customer");
        return;
    }

    if (!jobs.length || !jobs[0].mode) {
        alert("Add at least 1 job");
        return;
    }

    const res = await fetch(API + "/bookings", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
        title: jobs[0].description || "Booking",
        customer: selectedCustomerId,
        vehicle: document.getElementById("bookingVehicle").value,
        status: "booked",
        jobs: jobs
    })
});

console.log(res.status);

await res.json(); 

closeBookingModal();
show('bookings');
await loadBookings(); 
    
}

// ================= JOB UI =================

let jobs = [];

function addJob() {
    jobs.push({
        mode: null,
        description: "",
        time: ""
    });

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
                <button class="secondary" onclick="setJobMode(${i}, 'template')">Template</button>
                <button class="secondary" onclick="setJobMode(${i}, 'manual')">Manual</button>
            ` : ""}

            ${job.mode === "manual" ? `
                <input placeholder="Description"
                    oninput="updateJobField(${i}, 'description', this.value)">
                <input placeholder="Time (hours)"
                    oninput="updateJobField(${i}, 'time', this.value)">
            ` : ""}

            ${job.mode === "template" ? `
                <div style="color:#777;">Template (coming later)</div>
            ` : ""}
        </div>
        `;
    });

    document.getElementById("jobsContainer").innerHTML = html;
}