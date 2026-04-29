async function loadInvoices() {

    // LOAD REAL INVOICES
    const res = await fetch(API + "/invoices");
    const invoices = await res.json();

    // LOAD JOBS (for pending cards)
    const jobRes = await fetch(API + "/jobs");
    const jobsData = await jobRes.json();

    const pendingJobs = jobsData.filter(j => j.status === "pending-invoice");

    const invoiceCards = invoices.map(i => {

        const template = i.template || { items: [], labour: [] };

        const subtotal =
            (template.items || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0) +
            (template.labour || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0);

        const gst = subtotal * 0.10;
        const total = subtotal + gst;

        return `
        <div class="card" onclick="openInvoice('${i._id}')">
            <div class="title">$${total.toFixed(2)}</div>
            <div>Invoice</div>
        </div>
        `;
    });

    const pendingCards = pendingJobs.map(j => {

    const c = j.customer || {};
    const v = j.vehicle || {};

    return `
    <div class="card" onclick="openPendingJob('${j._id}')" style="border-left:6px solid purple;">
        <div class="title">${j.title}</div>

        <b>${c.firstName || ""} ${c.lastName || ""}</b><br>
        ${v.make || ""} ${v.model || ""}<br><br>

        <div>Pending Invoice</div>
    </div>
    `;
});

    document.getElementById("invoiceList").innerHTML =
        [...pendingCards, ...invoiceCards].join("");
}

async function openInvoice(id) {
    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    currentInvoice = invoice;

    const template = invoice.template || { items: [], labour: [], notes: "" };

    let jobData = null;
let customer = {};
let vehicle = {};

let jobId = null;

if (invoice.job) {
    jobId = invoice.job._id || invoice.job;
}

// 🔥 FALLBACK: try find matching pending job
if (!jobId) {
    const jobRes = await fetch(API + "/jobs");
    const jobs = await jobRes.json();

    const match = jobs.find(j =>
        j.summary === invoice.summary ||
        j.title === invoice.summary
    );

    if (match) jobId = match._id;
}

// 🔥 LOAD JOB IF FOUND
if (jobId) {
    const jobRes = await fetch(API + "/jobs/" + jobId);
    jobData = await jobRes.json();

    customer = jobData.customer || {};
    vehicle = jobData.vehicle || {};
}

    const subtotal =
        (template.items || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0) +
        (template.labour || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0);

    const gst = subtotal * 0.10;
    const total = subtotal + gst;

    let itemsHtml = "";
    let labourHtml = "";

    (template.items || []).forEach((i, index) => {
    itemsHtml += `
    <div style="display:flex; gap:6px; margin-bottom:6px;">
        <input value="${i.name || ""}" placeholder="Part" 
            onchange="updateItem(${index}, 'name', this.value)">

        <input type="number" value="${i.qty || 1}" style="width:60px"
            onchange="updateItem(${index}, 'qty', this.value)">

        <input type="number" value="${i.price || 0}" style="width:80px"
            onchange="updateItem(${index}, 'price', this.value)">

        <button onclick="removeItem(${index})">X</button>
    </div>`;
});

itemsHtml += `<button onclick="addItem()">+ Add Part</button>`;

    (template.labour || []).forEach((l, index) => {
    labourHtml += `
    <div style="display:flex; gap:6px; margin-bottom:6px;">
        <input value="${l.name || ""}" placeholder="Labour"
            onchange="updateLabour(${index}, 'name', this.value)">

        <input type="number" value="${l.qty || 1}" style="width:60px"
            onchange="updateLabour(${index}, 'qty', this.value)">

        <input type="number" value="${l.price || 0}" style="width:80px"
            onchange="updateLabour(${index}, 'price', this.value)">

        <button onclick="removeLabour(${index})">X</button>
    </div>`;
});

labourHtml += `<button onclick="addLabour()">+ Add Labour</button>`;

    document.getElementById("invoiceList").innerHTML = `

<div style="display:grid; grid-template-columns: minmax(0,2fr) minmax(300px,1fr); gap:15px; align-items:start;">

    <div>

        <div class="card">
    <div class="title">Tax Invoice</div>

    <div style="margin-bottom:12px;">
        <b>Date</b><br>
        ${new Date().toLocaleDateString()}
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:12px;">

    <div>
    <b>Customer Details</b><br><br>

    <div>First Name</div>
    <input value="${customer.firstName || ""}" onchange="updateCustomerField('firstName', this.value)">

    <div>Last Name</div>
    <input value="${customer.lastName || ""}" onchange="updateCustomerField('lastName', this.value)">

    <div>Contact</div>
    <input value="${customer.phone || ""}" onchange="updateCustomerField('phone', this.value)">

    <div>Email</div>
    <input value="${customer.email || ""}" onchange="updateCustomerField('email', this.value)">
</div>

    <div>
    <b>Vehicle</b><br><br>

    <div>Make</div>
    <input value="${vehicle.make || ""}" onchange="updateVehicleField('make', this.value)">

    <div>Model</div>
    <input value="${vehicle.model || ""}" onchange="updateVehicleField('model', this.value)">

    <div>Year</div>
    <input value="${vehicle.year || ""}" onchange="updateVehicleField('year', this.value)">

    <div>VIN</div>
    <input value="${vehicle.vin || ""}" onchange="updateVehicleField('vin', this.value)">

    <div>Odometer</div>
    <input value="${vehicle.odometer || ""}" onchange="updateVehicleField('odometer', this.value)">
</div>

</div>

    <div style="margin-bottom:10px;">
    <b>Jobs</b>

    <div style="color:#555;">

    ${
        jobData && jobData.jobs
        ? jobData.jobs.map((j, i) => `
            
            <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #eee;">
                
                <div><b>Job ${i + 1} Summary/Title</b><br>${j.summary || ""}</div>

                <div style="margin-top:6px;">
                    <b>Parts Replaced</b><br>
                    ${
                        (j.parts || []).length
                        ? j.parts.map(p => `${p.name || ""}`).join("<br>")
                        : "None"
                    }
                </div>

                <div style="margin-top:6px;">
                    <b>Description</b><br>
                    ${j.description || ""}
                </div>

            </div>

        `).join("")
        : "No jobs"
    }

    </div>
</div>

</div>

        <div class="card">
            <div class="title">Items</div>
            ${itemsHtml || "<div style='color:#777;'>No items</div>"}
        </div>

        <div class="card">
            <div class="title">Labour</div>
            ${labourHtml || "<div style='color:#777;'>No labour</div>"}
        </div>

    </div>

    <div>

        <div class="card">
            <div class="title">Invoice</div>

            <div style="display:flex; justify-content:space-between; margin:6px 0;">
                <span>Parts</span>
                <span>$${(template.items || []).reduce((t,x)=>t+(Number(x.price||0)*Number(x.qty||1)),0).toFixed(2)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; margin:6px 0;">
                <span>Labour</span>
                <span>$${(template.labour || []).reduce((t,x)=>t+(Number(x.price||0)*Number(x.qty||1)),0).toFixed(2)}</span>
            </div>

            <hr>

            <div style="display:flex; justify-content:space-between;">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>

            <div style="display:flex; justify-content:space-between;">
                <span>GST</span>
                <span>$${gst.toFixed(2)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold;">
                <span>Total</span>
                <span style="color:#2e7d32;">$${total.toFixed(2)}</span>
            </div>

            <br>

            <button class="primary" onclick="sendBackToJob('${invoice._id}')">+ Add Job</button>
            <button class="primary" onclick="finaliseInvoice('${invoice._id}')">Create Invoice</button>

            <button class="secondary" onclick="deleteInvoice('${invoice._id}')">
                Delete Invoice
            </button>

            <button class="secondary" onclick="loadInvoices()">Back</button>

        </div>

    </div>

</div>
`;
}

async function sendBackToJob(id) {

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    if (!invoice.job) return;

    const jobRes = await fetch(API + "/jobs/" + invoice.job);
    const job = await jobRes.json();

    job.status = "arrived";

    await fetch(API + "/jobs/" + job._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
    });

    await fetch(API + "/invoices/" + id, {
        method: "DELETE"
    });

    loadJobs();
}

async function finaliseInvoice(id) {

    const confirmDone = confirm("Create final invoice?");
    if (!confirmDone) return;

    await fetch(API + "/invoices/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status: "finalised"
        })
    });

    loadInvoices();
}

async function deleteInvoice(id) {

    const confirmDelete = confirm("Delete invoice?");
    if (!confirmDelete) return;

    await fetch(API + "/invoices/" + id, {
        method: "DELETE"
    });

    loadInvoices();
}

async function openPendingJob(id) {

    const res = await fetch(API + "/jobs/" + id);
    const job = await res.json();

    document.getElementById("invoiceList").innerHTML = `

<div style="display:grid; grid-template-columns: minmax(0,2fr) minmax(300px,1fr); gap:15px; align-items:start;">

    <div>

        <div class="card">
            <div class="title">Pending Invoice</div>

            <div style="margin-bottom:10px;">
                <b>Customer</b><br>
                ${job.customer?.firstName || ""} ${job.customer?.lastName || ""}
            </div>

            <div style="margin-bottom:10px;">
                <b>Vehicle</b><br>
                ${job.vehicle?.make || ""} ${job.vehicle?.model || ""}
            </div>

            <div>
                <b>Jobs</b><br>
                ${
                    (job.jobs || []).map((j, i) =>
                        `Job ${i + 1}: ${j.summary || ""}`
                    ).join("<br>") || "No jobs"
                }
            </div>
        </div>

    </div>

    <div>

        <div class="card">

            <button class="primary" onclick="sendPendingBack('${job._id}')">+ Add Job</button>
            <button class="primary" onclick="createInvoiceFromJob('${job._id}')">Create Invoice</button>

            <br><br>

            <button class="secondary" onclick="loadInvoices()">Back</button>

        </div>

    </div>

</div>
`;
}

async function sendPendingBack(id) {

    const summary = prompt("New job summary:");
    if (!summary) return;

    const res = await fetch(API + "/jobs/" + id);
    const job = await res.json();

    job.jobs = job.jobs || [];
    job.jobs.push({
        summary: summary,
        description: "",
        status: "pending"
    });

    job.status = "arrived";

    await fetch(API + "/jobs/" + job._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
    });

    loadJobs();
}

let currentInvoice = null;

function updateItem(index, field, value) {
    currentInvoice.template.items[index][field] = value;
}

function addItem() {
    currentInvoice.template.items.push({ name: "", qty: 1, price: 0 });
    openInvoice(currentInvoice._id);
}

function removeItem(index) {
    currentInvoice.template.items.splice(index, 1);
    openInvoice(currentInvoice._id);
}

function updateLabour(index, field, value) {
    currentInvoice.template.labour[index][field] = value;
}

function addLabour() {
    currentInvoice.template.labour.push({ name: "", qty: 1, price: 0 });
    openInvoice(currentInvoice._id);
}

function removeLabour(index) {
    currentInvoice.template.labour.splice(index, 1);
    openInvoice(currentInvoice._id);
}

async function createInvoiceFromJob(jobId) {

    const res = await fetch(API + "/jobs/" + jobId);
    const job = await res.json();

    const invoice = {
    job: job._id,
    status: "draft",
    template: {
        items: [],
        labour: (job.jobs || []).map(j => ({
            name: j.summary || "",
            qty: Math.max(1, Math.floor((j.timeSpent || 0) / 3600000)), // hours
            price: 0
        })),
        notes: (job.jobs || []).map(j => j.description || "").join("\n")
    },
    summary: job.jobs?.map(j => j.summary).join(", ")
};

    const createRes = await fetch(API + "/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice)
    });

    const newInvoice = await createRes.json();

    openInvoice(newInvoice._id);
}

async function updateCustomerField(field, value) {

    if (!currentInvoice?.job) return;

    const jobId = currentInvoice.job?._id || currentInvoice.job;

    const jobRes = await fetch(API + "/jobs/" + jobId);
    const job = await jobRes.json();

    const customerId = job.customer?._id || job.customer;
    if (!customerId) return;

    await fetch(API + "/customers/" + customerId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
    });
}

async function updateVehicleField(field, value) {

    if (!currentInvoice?.job) return;

    const jobId = currentInvoice.job?._id || currentInvoice.job;

    const jobRes = await fetch(API + "/jobs/" + jobId);
    const job = await jobRes.json();

    const vehicleId = job.vehicle?._id || job.vehicle;
    if (!vehicleId) return;

    await fetch(API + "/vehicles/" + vehicleId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
    });
}