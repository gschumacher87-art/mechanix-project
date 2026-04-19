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

    const locked = invoice.status === "finalised";

    document.getElementById("invoiceList").innerHTML = `
<div style="display:grid; grid-template-columns: 2fr 1fr; gap:15px; align-items:start;">

    <!-- LEFT SIDE -->
    <div>

        <div class="card">
            <div class="title">Customer Invoice ${locked ? "(FINAL)" : ""}</div>

            <div style="margin-bottom:10px;">
    <b>Invoice Summary</b>
    <div style="color:#555;">
        ${invoice.summary || template.notes || "No summary"}
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

            ${locked ? "" : `
            <button class="primary" onclick="addItem('${invoice._id}')">+ Add Item</button>
            <button class="primary" onclick="addLabour('${invoice._id}')">+ Add Labour</button>
            <button class="primary" onclick="addNote('${invoice._id}')">+ Add Note</button>
            <button class="primary" onclick="finaliseInvoice('${invoice._id}')">
                Finalise Invoice
            </button>
            `}

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

    if (invoice.status === "finalised") return alert("Invoice locked");

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

    if (invoice.status === "finalised") return alert("Invoice locked");

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

    if (invoice.status === "finalised") return alert("Invoice locked");

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

    const confirmDone = confirm("Finalise invoice? This cannot be edited.");
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

    show("customers");

    if (invoice.customer) {
        openCustomer(invoice.customer);
    }
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