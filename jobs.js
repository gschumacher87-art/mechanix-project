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
                        onclick="selectSubJob(${i})"
                        style="
                            padding:8px;
                            margin-bottom:6px;
                            border:${i === selectedSubJobIndex ? '2px solid #007bff' : '1px solid #ccc'};
                            cursor:pointer;
                        ">
                        ${j.summary || ""}
                    </div>
                `).join("") || "<span style='color:#777;'>No jobs</span>"
            }
        </div>

        <div class="card">
            <div class="title">Selected Job</div>
            <b>${selected.summary || ""}</b><br><br>
            <div style="color:#555;">${selected.description || "No description"}</div>

            <br>

            <button class="primary" onclick="clockOn()">Clock On</button>
            <button class="secondary" onclick="clockOff()">Clock Off</button>
        </div>
    `;

    let checklistHtml = "";

    (currentJob.checklist || []).forEach((item, i) => {
        checklistHtml += `
        <div style="display:flex; gap:10px; margin-bottom:6px;">
            <input type="checkbox"
                ${item.done ? "checked" : ""}
                onchange="toggleChecklist(${i})">
            <span>${item.text}</span>
        </div>`;
    });

    document.getElementById("jobCardChecklist").innerHTML =
        checklistHtml || "<div style='color:#777;'>No tasks</div>";

    document.getElementById("jobCardActions").innerHTML = `
        ${currentJob.status === "arrived" ? `
            <button class="primary" onclick="startJob()">Start Job</button>
        ` : ""}

        ${currentJob.status === "in-progress" ? `
            <button class="primary" onclick="finishJob()">Finish Job</button>
        ` : ""}

        <button class="secondary" onclick="deleteJob('${currentJob._id}')">Delete Job</button>
        <button class="secondary" onclick="show('jobs')">Back</button>
    `;
}

function selectSubJob(i) {
    selectedSubJobIndex = i;
    renderJobCard();
}

// ================= START JOB =================
async function startJob() {

    await fetch(API + "/jobs/" + currentJob._id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ status: "in-progress" })
    });

    show("jobs");
    loadJobs();
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

// ================= CHECKLIST =================
async function toggleChecklist(index) {
    currentJob.checklist[index].done = !currentJob.checklist[index].done;

    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            checklist: currentJob.checklist
        })
    });

    renderJobCard();
}

// ================= DELETE =================
async function deleteJob(id) {
    if (!confirm("Delete this job?")) return;

    await fetch(API + "/jobs/" + id, { method: "DELETE" });

    show("jobs");
    loadJobs();
}