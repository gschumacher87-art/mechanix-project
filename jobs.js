let currentJob = null;

async function loadJobs() {
    const res = await fetch(API + "/jobs");
    const data = await res.json();

    let booked = "", active = "", pending = "", completed = "";

    data.forEach(j => {

        const customerName =
            j.customer && typeof j.customer === "object"
                ? j.customer.firstName + " " + j.customer.lastName
                : "No customer";

        const vehicleName =
            j.vehicle && typeof j.vehicle === "object"
                ? j.vehicle.make + " " + j.vehicle.model
                : "";

        let color = "#ccc";
        if (j.status === "arrived") color = "orange";
        if (j.status === "in-progress") color = "#007bff";
        if (j.status === "pending-invoice") color = "purple";
        if (j.status === "completed") color = "green";

        const card = `
<div class="card" onclick="openJobCard('${j._id}')" style="border-left:6px solid ${color}">
    <div class="title">${j.title}</div>
    <span class="status ${j.status}">${j.status}</span><br><br>
    <b>${customerName}</b><br>
    ${vehicleName}
</div>`;

        if (j.status === "booked") booked += card;
        else if (j.status === "arrived") booked += card;
        else if (j.status === "in-progress") active += card;
        else if (j.status === "pending-invoice") pending += card;
        else if (j.status === "completed") completed += card;
        else booked += card;
    });

    jobList.innerHTML = `
        <div class="title">Booked</div>
        ${booked || "<div class='card'>No bookings</div>"}

        <div class="title">In Workshop</div>
        ${active || "<div class='card'>No active jobs</div>"}

        <div class="title">Pending</div>
        ${pending || "<div class='card'>No pending jobs</div>"}

        <div class="title">Completed</div>
        ${completed || "<div class='card'>No completed jobs</div>"}
    `;
}

async function openJobCard(id) {
    const res = await fetch(API + "/jobs/" + id);
    currentJob = await res.json();

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("jobCard").classList.add("active");

    renderJobCard();
}

function renderJobCard() {

    let checklistHtml = "";

    currentJob.checklist ??= [];

    currentJob.checklist.forEach((item, i) => {
        checklistHtml += `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <input type="checkbox" ${item.done ? "checked" : ""} onchange="toggleChecklist(${i})">
            <span>${item.text}</span>
        </div>`;
    });

    document.getElementById("jobCardInfo").innerHTML = `
        <div class="card">
            <div class="title">${currentJob.title}</div>
            <b>Status:</b> ${currentJob.status}<br>
            <b>Customer:</b> ${currentJob.customer?.firstName || ""} ${currentJob.customer?.lastName || ""}<br>
            <b>Vehicle:</b> ${currentJob.vehicle?.make || ""} ${currentJob.vehicle?.model || ""}
        </div>
    `;

    document.getElementById("jobCardChecklist").innerHTML = `
        ${checklistHtml || "<div style='color:#777;'>No tasks</div>"}
    `;

    document.getElementById("jobCardActions").innerHTML = `
    <button class="primary" onclick="startJobFromCard()">Start Job</button>
    <button class="primary" onclick="finishJob()">Finish Job</button>
    <button class="secondary" onclick="deleteJob('${currentJob._id}')">Delete Job</button>
    <button class="secondary" onclick="show('jobs')">Back</button>
`;
}

async function startJobFromCard() {
    currentJob.status = "in-progress";

    await fetch(API + "/jobs/" + currentJob._id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ status: "in-progress" })
    });

    show("jobs");
    loadJobs();
}

async function finishJob() {

    if (!currentJob) return;

    if (currentJob.status === "pending-invoice") return;

    // SAFE ID EXTRACTION (STRICT)
    const customerId =
        currentJob.customer && typeof currentJob.customer === "object"
            ? currentJob.customer._id
            : currentJob.customer;

    const vehicleId =
        currentJob.vehicle && typeof currentJob.vehicle === "object"
            ? currentJob.vehicle._id
            : currentJob.vehicle;

    // HARD VALIDATION (NO FALLBACKS)
    if (!customerId || !vehicleId) {
        alert("Missing customer or vehicle on job");
        return;
    }

    // UPDATE JOB STATUS FIRST
    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending-invoice" })
    });

    // CREATE INVOICE
    // CREATE INVOICE FROM JOB (CORRECT FLOW)
const res = await fetch(API + "/invoices/from-job/" + currentJob._id, {
    method: "POST"
});

    if (!res.ok) {
        const err = await res.text();
        alert("Invoice error: " + err);
        return;
    }
await loadJobs();
    show("invoices");
    loadInvoices();
}

async function toggleChecklist(index) {
    currentJob.checklist[index].done = !currentJob.checklist[index].done;

    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentJob)
    });

    renderJobCard();
}

async function deleteJob(id) {
    if (!confirm("Delete this job?")) return;

    await fetch(API + "/jobs/" + id, { method: "DELETE" });

    show("jobs");
    loadJobs();
}
window.finishJob = finishJob;
