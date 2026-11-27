let currentJob = null;
let selectedSubJobIndex = 0;
// ================= LOAD JOBS =================
async function loadJobs() {
    const res = await fetch(API + "/jobs");
    const data = await res.json();
    jobs = data;
    let arrived = "";
    let active = "";
    data.forEach(j => {
        const customer =
            j.customerName ||
            `${j.customer?.firstName || ""} ${j.customer?.lastName || ""}`.trim() ||
            "No customer";
        const vehicle =
            `${j.make || j.vehicle?.make || ""} ${j.model || j.vehicle?.model || ""} ${j.buildDate || j.vehicle?.buildDate || ""}`.trim();
        const card = `
            <div class="card" onclick="openJobCard('${j._id}')">
                <h3>${j.title || "Job"}</h3>
                <b>${customer}</b><br>
                ${vehicle}<br>
                Rego: ${j.rego || j.vehicle?.rego || ""}
                <hr>
                ${(j.jobs || []).map(x => `
                    <div>
                        • ${x.summary || "Job"}
                        ${x.status === "done" ? "✔" : ""}
                    </div>
                `).join("")}
            </div>
        `;
        if (j.status === "arrived") arrived += card;
        if (j.status === "in-progress") active += card;
    });
    jobList.innerHTML = `
        <h2>Arrived</h2>
        ${arrived || "<div class='card'>No jobs</div>"}
        <h2>In Workshop</h2>
        ${active || "<div class='card'>No active jobs</div>"}
    `;
}
// ================= OPEN JOB =================
async function openJobCard(id) {
    const res = await fetch(API + "/jobs/" + id);
    currentJob = await res.json();
    selectedSubJobIndex = 0;
    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));
    document.getElementById("jobCard").classList.add("active");
    renderJobCard();
}
// ================= RENDER JOB =================
function renderJobCard() {
    const subJobs = currentJob.jobs || [];
    document.getElementById("jobCardInfo").innerHTML = `
        <div class="card">
            <h3>${currentJob.customerName || ""}</h3>
            ${currentJob.phone || ""}
            <hr>
            <b>Vehicle</b><br>
            ${currentJob.make || ""} ${currentJob.model || ""}<br>
            ${currentJob.buildDate || ""}<br>
            Rego: ${currentJob.rego || ""}<br>
            VIN: ${currentJob.vehicle?.vin || ""}
        </div>
        <div class="card">
            <h3>Jobs</h3>
            ${subJobs.map((j, i) => `
                <div class="card">
                    <b>${j.summary || "Job"}</b>
                    <p>
                        ${j.status === "done" ? "Completed" :
                          j.startedAt ? "Running" :
                          j.timeSpent ? "Paused" : "Waiting"}
                    </p>
                    <button onclick="clockOn(${i})">Start</button>
                    <button onclick="clockOff(${i})">Pause</button>
                    <button onclick="finishSubJob(${i})">Finish</button>
                </div>
            `).join("")}
        </div>
        <button class="secondary" onclick="deleteJobCard()">
            Delete Job Card
        </button>
    `;
}
// ================= SAVE =================
async function saveSubJobs() {
    await fetch(API + "/jobs/" + currentJob._id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            jobs: currentJob.jobs,
            status: currentJob.status
        })
    });
    renderJobCard();
    loadJobs();
}
// ================= START =================
function clockOn(i) {
    const now = Date.now();
    const selected = currentJob.jobs[i];
    if (selected.status === "done") return;
    currentJob.jobs.forEach(j => {
        if (j.startedAt) {
            j.timeSpent = (j.timeSpent || 0) + now - j.startedAt;
            j.startedAt = null;
            j.status = "paused";
        }
    });
    selected.startedAt = now;
    selected.status = "in-progress";
    currentJob.status = "in-progress";
    saveSubJobs();
}
// ================= PAUSE =================
function clockOff(i) {
    const job = currentJob.jobs[i];
    if (job.status === "done") return;
    if (job.startedAt) {
        job.timeSpent = (job.timeSpent || 0) + Date.now() - job.startedAt;
        job.startedAt = null;
    }
    job.status = "paused";
    currentJob.status = currentJob.jobs.some(j => j.startedAt)
        ? "in-progress"
        : "arrived";
    saveSubJobs();
}
// ================= FINISH =================
async function finishSubJob(i) {
    const job = currentJob.jobs[i];
    if (job.status === "done") return;
    if (job.startedAt) {
        job.timeSpent = (job.timeSpent || 0) + Date.now() - job.startedAt;
        job.startedAt = null;
    }
    job.status = "done";
    const allDone = currentJob.jobs.every(j => j.status === "done");
    if (allDone) {
        currentJob.status = "pending-invoice";
    } else {
        currentJob.status = currentJob.jobs.some(j => j.startedAt)
            ? "in-progress"
            : "arrived";
    }
    await saveSubJobs();
}
// ================= DELETE =================
async function deleteJobCard() {
    if (!confirm("Delete entire job card?")) return;
    await fetch(API + "/jobs/" + currentJob._id, {
        method: "DELETE"
    });
    currentJob = null;
    show("jobs");
    loadJobs();
}