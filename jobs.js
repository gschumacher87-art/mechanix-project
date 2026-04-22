let currentJob = null;
let selectedSubJobIndex = 0;

// ================= LOAD JOBS =================
async function loadJobs() {
    const res = await fetch(API + "/jobs?t=" + Date.now());
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
        let hasInProgress = (j.jobs || []).some(x => x.status === "in-progress");
let hasPaused = (j.jobs || []).some(x => x.status === "paused");
let allDone = (j.jobs || []).length && (j.jobs || []).every(x => x.status === "done");

let displayStatus = "arrived";

if (allDone) displayStatus = "pending-invoice";
else if (hasInProgress || hasPaused) displayStatus = "in-progress";

if (displayStatus === "arrived") color = "orange";
if (displayStatus === "in-progress") color = "#007bff";
if (displayStatus === "pending-invoice") color = "purple";
if (displayStatus === "completed") color = "green";

        const card = `
<div class="card" onclick="openJobCard('${j._id}')" style="border-left:6px solid ${color}">
    <div class="title">${j.title}</div>
<span class="status ${displayStatus}">${displayStatus}</span>

${
    (j.jobs || []).map(x => `
    <div style="font-size:14px;">
        • ${x.summary}
        ${
            x.status === "in-progress"
                ? '<span style="color:#28a745; font-weight:bold;"> [ACTIVE]</span>'
                : x.status === "done"
                    ? '<span style="color:#6c757d;"> [DONE]</span>'
                    : ''
        }
    </div>
`).join("")
}

<br>
<b>${customerName}</b><br>
${vehicleName}
</div>`;

        if (displayStatus === "arrived") booked += card;
else if (displayStatus === "in-progress") active += card;
else if (displayStatus === "pending-invoice") pending += card;
else if (displayStatus === "completed") completed += card;
else booked += card;
    });

    jobList.innerHTML = `
        <div class="title">Booked</div>
        ${booked || "<div class='card'>No jobs</div>"}

        <div class="title">In Workshop</div>
        ${active || "<div class='card'>No active jobs</div>"}

        <div class="title">Pending</div>
        ${pending || "<div class='card'>No pending jobs</div>"}

        <div class="title">Completed</div>
        ${completed || "<div class='card'>No completed jobs</div>"}
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
    <b>Customer:</b> ${currentJob.customer?.firstName || ""} ${currentJob.customer?.lastName || ""}<br>
    <b>Vehicle:</b> ${currentJob.vehicle?.make || ""} ${currentJob.vehicle?.model || ""}<br>
   ${(() => {
    const jobs = currentJob.jobs || [];
    const hasInProgress = jobs.some(x => x.status === "in-progress");
    const hasPaused = jobs.some(x => x.status === "paused");
    const allDone = jobs.length && jobs.every(x => x.status === "done");

    let displayStatus = "arrived";
    if (allDone) displayStatus = "pending-invoice";
    else if (hasInProgress || hasPaused) displayStatus = "in-progress";

    return `<b>Status:</b> ${displayStatus}`;
})()}

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
j.status === "done"
    ? '<span style="color:#6c757d;"> ✔ Done</span>'
    : j.status === "in-progress"
        ? '<span style="color:#28a745;"> ● Running</span>'
        : j.status === "paused"
            ? '<span style="color:#ffc107;"> ● Paused</span>'
            : ''
}
        </div>

        <div style="font-size:12px; color:#777; margin-top:4px;">
            ${j.description || "No description"}
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
            <div style="color:#555;">${selected.description || "No description"}</div>

            <br>

            <button class="primary" onclick="event.stopPropagation(); clockOn(selectedSubJobIndex)">Clock On</button>
<button class="secondary" onclick="event.stopPropagation(); clockOff(selectedSubJobIndex)">Clock Off</button>
<button class="primary" onclick="event.stopPropagation(); finishSubJob(selectedSubJobIndex)">Finish</button>
        </div>
    `;

}

function selectSubJob(i) {
    selectedSubJobIndex = i;
    renderJobCard();
}

// ================= FINISH JOB =================
async function finishJob() {

    await fetch(API + "/jobs/" + currentJob._id + "?t=" + Date.now(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending-invoice" })
    });

    await fetch(API + "/invoices/from-job/" + currentJob._id, {
        method: "POST"
    });

    show("jobs");
    loadJobs();
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

    await fetch(API + "/jobs/" + currentJob._id + "?t=" + Date.now(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jobs: currentJob.jobs
        })
    });

    const res = await fetch(API + "/jobs/" + currentJob._id + "?t=" + Date.now());
    currentJob = await res.json();

    renderJobCard();
}

function editSubJob(i) {

    const job = currentJob.jobs[i];

    const newSummary = prompt("Edit job summary:", job.summary);
    if (newSummary === null) return;

    const newDesc = prompt("Edit description:", job.description || "");

    job.summary = newSummary;
    job.description = newDesc || "";

    saveSubJobs();
}

async function clockOn(i) {

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

    await saveSubJobs();
}

async function clockOff(i) {

    const job = currentJob.jobs[i];

    // ❌ prevent touching finished jobs
    if (job.status === "done") return;

    if (job.startedAt) {
        const time = Date.now() - job.startedAt;
        job.timeSpent = (job.timeSpent || 0) + time;
        job.startedAt = null;
    }

    job.status = "paused";

    // check if any job still running
    const anyActive = currentJob.jobs.some(j => 
    j.status === "in-progress" || j.status === "paused"
);

currentJob.status = anyActive ? "in-progress" : "arrived";

    await saveSubJobs();
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
    } else {
        const anyActive = currentJob.jobs.some(j => 
            j.status === "in-progress" || j.status === "paused"
        );

        currentJob.status = anyActive ? "in-progress" : "arrived";
    }

    await saveSubJobs();
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