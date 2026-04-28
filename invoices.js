async function loadInvoices() {
    const res = await fetch(API + "/invoices");
    const data = await res.json();

    document.getElementById("invoiceList").innerHTML = data.map(i => {

        const template = i.template || { items: [], labour: [] };

        const subtotal =
            (template.items || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0) +
            (template.labour || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0);

        const gst = subtotal * 0.10;
        const total = subtotal + gst;

        return `
        <div class="card" onclick="openInvoice('${i._id}')">
            <div class="title">$${total.toFixed(2)}</div>
            <div>Tap to view</div>
        </div>
        `;
    }).join("");
}

async function openInvoice(id) {
    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    const template = invoice.template || { items: [], labour: [], notes: "" };

    let jobData = null;

    if (invoice.job) {
        const jobRes = await fetch(API + "/jobs/" + invoice.job);
        jobData = await jobRes.json();
    }

    const subtotal =
        (template.items || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0) +
        (template.labour || []).reduce((t, x) => t + (Number(x.price || 0) * Number(x.qty || 1)), 0);

    const gst = subtotal * 0.10;
    const total = subtotal + gst;

    let itemsHtml = "";
    let labourHtml = "";

    (template.items || []).forEach(i => {
        itemsHtml += `
        <div style="display:flex; justify-content:space-between; padding:6px 0;">
            <span>${i.name} x${i.qty || 1}</span>
            <span>$${(Number(i.price) * Number(i.qty || 1)).toFixed(2)}</span>
        </div>`;
    });

    (template.labour || []).forEach(l => {
        labourHtml += `
        <div style="display:flex; justify-content:space-between; padding:6px 0;">
            <span>${l.name} x${l.qty || 1}</span>
            <span>$${(Number(l.price) * Number(l.qty || 1)).toFixed(2)}</span>
        </div>`;
    });

    document.getElementById("invoiceList").innerHTML = `

<div style="display:grid; grid-template-columns: minmax(0,2fr) minmax(300px,1fr); gap:15px; align-items:start;">

    <div>

        <div class="card">
            <div class="title">Pending Invoice</div>

            <div style="margin-bottom:10px;">
                <b>Jobs</b>
                <div style="color:#555;">
                    ${
                        jobData && jobData.jobs
                            ? jobData.jobs.map((j, i) =>
                                `Job ${i + 1}: ${j.summary || ""}`
                              ).join("<br>")
                            : (invoice.summary || template.notes || "No jobs")
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