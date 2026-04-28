async function loadInvoices() {
    const res = await fetch(API + "/invoices");
    const data = await res.json();

    document.getElementById("invoiceList").innerHTML = data
        .filter(i => i.status !== "finalised")
        .map(i => {

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

// LOAD JOB DATA
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

    const locked = false;

    document.getElementById("invoiceList").innerHTML = `

<div style="display:grid; grid-template-columns: minmax(0,2fr) minmax(300px,1fr); gap:15px; align-items:start;">

    <!-- LEFT SIDE -->
    <div>

        <div class="card">
            <div class="title">Customer Invoice ${locked ? "(FINAL)" : ""}</div>

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

        <div class="card">
            <div class="title">Items</div>
            ${itemsHtml || "<div style='color:#777;'>No items</div>"}
        </div>

        <div class="card">
            <div class="title">Labour</div>
            ${labourHtml || "<div style='color:#777;'>No labour</div>"}
        </div>

    </div>

    <!-- RIGHT SIDE -->
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

           <button class="primary" onclick="addItem('${invoice._id}')">+ Add Item</button>
<button class="primary" onclick="addLabour('${invoice._id}')">+ Add Labour</button>
<button class="primary" onclick="addNote('${invoice._id}')">+ Add Note</button>
<button class="primary" onclick="finaliseInvoice('${invoice._id}')">
    Finalise Invoice
</button>

            <button class="secondary" onclick="deleteInvoice('${invoice._id}')">
                Delete Invoice
            </button>

            <button class="secondary" onclick="loadInvoices()">Back</button>

        </div>

    </div>

</div>
`;
}

async function addItem(id) {

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    const name = prompt("Item name:");
    if (!name) return;

    const price = Number(prompt("Price:"));
    if (!price) return;

    const qty = Number(prompt("Qty:")) || 1;

    const template = {
        items: [...(invoice.template?.items || [])],
        labour: [...(invoice.template?.labour || [])],
        notes: invoice.template?.notes || ""
    };

    template.items.push({ name, price, qty });

    await fetch(API + "/invoices/" + id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            template: template
        })
    });

    openInvoice(id);
}

async function addLabour(id) {

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    const name = prompt("Labour description:");
    if (!name) return;

    const price = Number(prompt("Price:"));
    if (!price) return;

    const qty = Number(prompt("Hours:")) || 1;

    const template = {
        items: [...(invoice.template?.items || [])],
        labour: [...(invoice.template?.labour || [])],
        notes: invoice.template?.notes || ""
    };

    template.labour.push({ name, price, qty });

    await fetch(API + "/invoices/" + id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            template: template
        })
    });

    openInvoice(id);
}

async function addNote(id) {

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    const note = prompt("Note:");
    if (!note) return;

    const template = {
        items: [...(invoice.template?.items || [])],
        labour: [...(invoice.template?.labour || [])],
        notes: note
    };

    await fetch(API + "/invoices/" + id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            template: template
        })
    });

    openInvoice(id);
}

async function finaliseInvoice(id) {

    const confirmDone = confirm("Finalise invoice?");
    if (!confirmDone) return;

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    await fetch(API + "/invoices/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status: "finalised"
        })
    });

    const jobRes = await fetch(API + "/jobs/" + invoice.job);
    const job = await jobRes.json();

    job.status = "completed";

    await fetch(API + "/jobs/" + job._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
    });

    loadInvoices();
}
async function deleteInvoice(id) {

    const confirmDelete = confirm("Delete invoice?");
    if (!confirmDelete) return;

    document.getElementById("invoiceList").innerHTML = "Deleting...";

    await fetch(API + "/invoices/" + id, {
        method: "DELETE"
    });

    setTimeout(loadInvoices, 200);
}