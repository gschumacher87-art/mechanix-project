let currentJob = null;
let selectedSubJobIndex = 0;

// ================= LOAD JOBS =================
async function loadJobs() {
    const res = await fetch(API + "/jobs");
    const data = await res.json();

    let booked = "", active = "", completed = "";

    data.forEach(j => {

        const customerName =
    j.customerName ||
    (
        j.customer && typeof j.customer === "object"
            ? j.customer.firstName + " " + j.customer.lastName
            : "No customer"
    );

       const vehicleName =
    (
        `${j.make || ""} ${j.model || ""} ${j.buildDate || ""}`.trim()
    ) ||
    j.vehicleName ||
    (
        j.vehicle && typeof j.vehicle === "object"
            ? `${j.vehicle.make || ""} ${j.vehicle.model || ""}`.trim()
            : ""
    );

        let color = "#ccc";
        if (j.status === "arrived") color = "orange";
        if (j.status === "in-progress") color = "#007bff";
        if (j.status === "pending-invoice") color = "purple";
        if (j.status === "completed") color = "green";

        const card = `
<div class="card" onclick="${
    j.status === 'pending-invoice'
        ? `createInvoiceFromJob('${j._id}')`
        : `openJobCard('${j._id}')`
}" style="border-left:6px solid ${color}">
    <div class="title">${j.title}</div>
<span class="status ${j.status}">${j.status}</span><br><br>

${
    (j.jobs || []).map((x, i) => `
        <div style="font-size:14px;">
            • ${x.summary}
            ${
                x.status === "done"
? `<span style="color:#6c757d;"> (done)</span>`
: x.startedAt
    ? `<span style="color:#28a745; font-weight:bold;"> (running)</span>`
    : x.timeSpent
        ? `<span style="color:#ffc107;"> (paused)</span>`
        : ``
            }
        </div>
    `).join("")
}

<br>
<b>${customerName}</b><br>
${vehicleName}
</div>`;

        if (j.status === "arrived") booked += card;
else if (j.status === "in-progress") active += card;
    });

    jobs = data;

jobList.innerHTML = `
        <div class="title">Booked</div>
        ${booked || "<div class='card'>No jobs</div>"}

        <div class="title">In Workshop</div>
        ${active || "<div class='card'>No active jobs</div>"}
    `;
}

// ================= OPEN JOB =================
async function openJobCard(id) {
    const res = await fetch(API + "/jobs/" + id);
    currentJob = await res.json();
    selectedSubJobIndex = 0;


    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("jobCard").classList.add("active");

    renderJobCard();
}

// ================= RENDER JOB =================
function renderJobCard() {

    const jobs = currentJob.jobs || [];
    const selected = jobs[selectedSubJobIndex] || {};

    document.getElementById("jobCardInfo").innerHTML = `
        <div class="card">
<div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;">

<div style="flex:1;min-width:200px;">
    <b>Customer:</b><br>
    ${
        currentJob.customerName ||
        `${currentJob.customer?.firstName || ""} ${currentJob.customer?.lastName || ""}`
    }<br><br>

    <b>Contact:</b><br>
    ${currentJob.phone || ""}<br><br>

    <b>Status:</b><br>
    ${currentJob.status}
</div>

<div style="flex:1;min-width:200px;">
    <b>Vehicle Details:</b><br>

    <b>Rego:</b> ${currentJob.rego || currentJob.vehicle?.rego || ""}<br>

    <b>VIN:</b> ${currentJob.vehicle?.vin || ""}<br>

    <b>Make:</b> ${currentJob.make || currentJob.vehicle?.make || ""}<br>

    <b>Model:</b> ${currentJob.model || currentJob.vehicle?.model || ""}<br>

    <b>Build:</b> ${currentJob.buildDate || currentJob.vehicle?.buildDate || ""}
</div>

</div>

<br>

<button class="secondary" onclick="deleteJobCard()">Delete Job Card</button>
</div>

        <div class="card">
    <div class="title">Jobs</div>
    ${
        jobs.map((j, i) => `
    <div 
        style="
            padding:8px;
            margin-bottom:10px;
            border:${
j.status === "done"
    ? '2px solid #6c757d'
    : j.status === "in-progress"
        ? '2px solid #28a745'
        : j.status === "paused"
            ? '2px solid #ffc107'
            : i === selectedSubJobIndex
                ? '2px solid #007bff'
                : '1px solid #ccc'
};
        ">

        <div onclick="selectSubJob(${i})" style="cursor:pointer;">
            <b>${j.summary || "No Title"}</b>
${
(() => {

    let time = j.timeSpent || 0;

    if (j.startedAt) {
        time += Date.now() - j.startedAt;
    }

    const mins = Math.floor(time / 60000);

    if (j.status === "done") {
        return `<span style="color:#6c757d;"> ✔ Done (${mins}m)</span>`;
    }

    if (j.startedAt) {
        return `<span style="color:#28a745;"> ● Running (${mins}m)</span>`;
    }

    if (j.timeSpent) {
        return `<span style="color:#ffc107;"> ● Paused (${mins}m)</span>`;
    }

    return '';

})()
}
        </div>


        <br>

        <button class="secondary" onclick="editSubJob(${i})">Edit</button>
        <button class="secondary" onclick="deleteSubJob(${i})">Delete</button>
    </div>
`).join("") || "<span style='color:#777;'>No jobs</span>"
    }
</div>

        <div class="card">
    <div class="title">Selected Job</div>

    <b>${selected.summary || ""}</b><br><br>

    <button class="secondary" onclick="addPart()">Add Part</button>
    <button class="secondary" onclick="addInspection()">Add Inspection</button>
    <button class="secondary" onclick="addNote()">Add Note</button>
    <button class="secondary" onclick="addPhoto()">Add Photo</button>

    <br><br>

    <b>Parts</b><br>
    ${
        (selected.parts || []).map((p, i) => `
<div style="margin-bottom:8px;">

<input
    placeholder="Description"
    value="${p.description || ""}"
    onchange="
        currentJob.jobs[selectedSubJobIndex].parts[${i}].description=this.value;
        saveSubJobs();
    "
>

<input
    placeholder="Part Number"
    value="${p.partNumber || ""}"
    onchange="
        currentJob.jobs[selectedSubJobIndex].parts[${i}].partNumber=this.value;
        saveSubJobs();
    "
>

<input
    type="number"
    placeholder="Qty"
    value="${p.qty || 1}"
    onchange="
        currentJob.jobs[selectedSubJobIndex].parts[${i}].qty=parseFloat(this.value)||1;
        saveSubJobs();
    "
>

</div>
`).join("") || "None"
    }

    <br>

    <b>Inspections</b><br>
    ${
        (selected.inspections || []).map(x =>
            `<div>• ${x}</div>`
        ).join("") || "None"
    }

    <br>

    <b>Notes</b><br>
    ${
        (selected.notes || []).map(x =>
            `<div>• ${x}</div>`
        ).join("") || "None"
    }

    <br><br>

    <button class="primary" onclick="clockOn(selectedSubJobIndex)">Clock On</button>
    <button class="secondary" onclick="clockOff(selectedSubJobIndex)">Clock Off</button>
    <button class="primary" onclick="finishSubJob(selectedSubJobIndex)">Complete</button>

</div>
    `;

}

function selectSubJob(i) {
    selectedSubJobIndex = i;
    renderJobCard();
}

// ================= FINISH JOB =================
async function finishJob() {

    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status: currentJob.status,
            jobs: currentJob.jobs
        })
    });

    const res = await fetch(API + "/invoices/from-job/" + currentJob._id, {
        method: "POST"
    });

    const invoice = await res.json();

    openInvoice(invoice._id);
}
// ================= DELETE =================
async function deleteJob(id) {
    if (!confirm("Delete this job?")) return;

    await fetch(API + "/jobs/" + id, { method: "DELETE" });

    show("jobs");
    loadJobs();
}

function deleteSubJob(i) {

    if (!confirm("Delete this job?")) return;

    currentJob.jobs.splice(i, 1);

    if (selectedSubJobIndex >= currentJob.jobs.length) {
        selectedSubJobIndex = Math.max(0, currentJob.jobs.length - 1);
    }

    saveSubJobs();
}

async function saveSubJobs() {

    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    jobs: currentJob.jobs,
    status: currentJob.status
})
    });

    renderJobCard();
    
    loadJobs();
}

function editSubJob(i) {

    const job = currentJob.jobs[i];

    const newSummary = prompt("Edit job summary:", job.summary);
    if (newSummary === null) return;

    job.summary = newSummary;

    saveSubJobs();
}

function clockOn(i) {

    const job = currentJob.jobs[i];

    // ❌ prevent restarting finished jobs
    if (job.status === "done") return;

    const now = Date.now();

    // STOP any running job first
    currentJob.jobs.forEach(j => {
        if (j.startedAt) {
            const time = now - j.startedAt;
            j.timeSpent = (j.timeSpent || 0) + time;
            j.startedAt = null;
            j.status = "paused";
        }
    });

    // START selected job
    job.startedAt = now;
    job.status = "in-progress";

    // update parent job status
    currentJob.status = "in-progress";

    saveSubJobs();
}

function clockOff(i) {

    const job = currentJob.jobs[i];

    // ❌ prevent touching finished jobs
    if (job.status === "done") return;

    if (job.startedAt) {
        const time = Date.now() - job.startedAt;
        job.timeSpent = (job.timeSpent || 0) + time;
        job.startedAt = null;
    }

    job.status = "paused";

    // check if any job still running (FIXED)
    const anyRunning = currentJob.jobs.some(j => j.startedAt);

    currentJob.status = anyRunning ? "in-progress" : "arrived";

    saveSubJobs();
}

async function finishSubJob(i) {

    const now = Date.now();

    currentJob.jobs.forEach(j => {
        if (j.startedAt) {
            const time = now - j.startedAt;
            j.timeSpent = (j.timeSpent || 0) + time;
            j.startedAt = null;
        }
    });

    const job = currentJob.jobs[i];
    job.status = "done";

    const allDone = currentJob.jobs.every(j => j.status === "done");

    if (allDone) {

    currentJob.status = "pending-invoice";

    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jobs: currentJob.jobs,
            status: currentJob.status
        })
    });

    renderJobCard();
    loadJobs();

    return;

} else {

    const anyRunning = currentJob.jobs.some(j => j.startedAt);
    currentJob.status = anyRunning ? "in-progress" : "arrived";

    saveSubJobs();
}
}

function deleteJobCard() {

    const confirmDelete = confirm("Delete entire job card?");
    if (!confirmDelete) return;

    fetch(API + "/jobs/" + currentJob._id, {
        method: "DELETE"
    }).then(() => {
        show("jobs");
        loadJobs();
    });

}
function addPart() {

    const job = currentJob.jobs[selectedSubJobIndex];

    if (!job.parts) job.parts = [];

    job.parts.push({
        description: "",
        partNumber: "",
        qty: 1
    });

    saveSubJobs();
}

function addInspection() {

    const text = prompt("Inspection");

    if (!text) return;

    const job = currentJob.jobs[selectedSubJobIndex];

    if (!job.inspections) job.inspections = [];

    job.inspections.push(text);

    saveSubJobs();
}

function addNote() {

    const text = prompt("Note");

    if (!text) return;

    const job = currentJob.jobs[selectedSubJobIndex];

    if (!job.notes) job.notes = [];

    job.notes.push(text);

    saveSubJobs();
}

function addPhoto() {

    alert("Photo upload later");
}
