let currentJob = null;
let selectedSubJobIndex = 0;

// ================= LOAD JOBS =================
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

${
    (j.jobs || []).map(x => `
        <div style="font-size:14px;">• ${x.summary}</div>
    `).join("")
}

<br>
<b>${customerName}</b><br>
${vehicleName}
</div>`;

        if (j.status === "arrived") booked += card;
        else if (j.status === "in-progress") active += card;
        else if (j.status === "pending-invoice") pending += card;
        else if (j.status === "completed") completed += card;
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
            <b>Status:</b> ${currentJob.status}
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
    j.startedAt
        ? '2px solid #28a745'
        : i === selectedSubJobIndex
            ? '2px solid #007bff'
            : '1px solid #ccc'
};
                ">

                <div onclick="selectSubJob(${i})" style="cursor:pointer;">
                    <b>${j.summary || "No Title"}</b>
${j.startedAt ? '<span style="color:#28a745;"> ● Running</span>' : ''}
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

            <button class="primary" onclick="clockOn(selectedSubJobIndex)">Clock On</button>
<button class="secondary" onclick="clockOff(selectedSubJobIndex)">Clock Off</button>
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

    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    jobs: currentJob.jobs,
    status: currentJob.status
})
    });

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

function clockOn(i) {

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
    const job = currentJob.jobs[i];
    job.startedAt = now;
    job.status = "in-progress";

    // update parent job status
    currentJob.status = "in-progress";

    saveSubJobs();
}

function clockOff(i) {

    const job = currentJob.jobs[i];

    if (job.startedAt) {
        const time = Date.now() - job.startedAt;
        job.timeSpent = (job.timeSpent || 0) + time;
        job.startedAt = null;
    }

    job.status = "paused";

    saveSubJobs();
}