async function loadInvoices() {
    const res = await fetch(API + "/invoices");
    const data = await res.json();

    document.getElementById("invoiceList").innerHTML = data.map(i => `
        <div class="card" onclick="openInvoice('${i._id}')">
            <div class="title">$${i.totalCost}</div>
            <div>Tap to view</div>
        </div>
    `).join("");
}

async function openInvoice(id) {
    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    const template = invoice.template || { items: [], labour: [], notes: "" };

    let itemsHtml = "";
    let labourHtml = "";

    (template.items || []).forEach(i => {
        itemsHtml += `
        <div style="display:flex; justify-content:space-between; padding:6px 0;">
            <span>${i.name}</span>
            <span>$${i.price}</span>
        </div>`;
    });

    (template.labour || []).forEach(l => {
        labourHtml += `
        <div style="display:flex; justify-content:space-between; padding:6px 0;">
            <span>${l.name}</span>
            <span>$${l.price}</span>
        </div>`;
    });

    document.getElementById("invoiceList").innerHTML = `
        <div class="card">

            <div style="text-align:center; font-size:22px; font-weight:bold;">
                INVOICE
            </div>

            <hr>

            <div style="margin-bottom:10px;">
                <b>Items</b>
                ${itemsHtml || "<div style='color:#777;'>No items</div>"}
            </div>

            <div style="margin-bottom:10px;">
                <b>Labour</b>
                ${labourHtml || "<div style='color:#777;'>No labour</div>"}
            </div>

            <div style="margin-bottom:10px;">
                <b>Notes</b><br>
                <div style="color:#555;">
                    ${template.notes || "No notes"}
                </div>
            </div>

            <hr>

            <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold;">
                <span>Total</span>
                <span>$${invoice.totalCost}</span>
            </div>

        </div>

        <div class="card">
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
    `;
}

async function addItem(id) {

    const name = prompt("Item name:");
    if (!name) return;

    const price = Number(prompt("Price:"));
    if (!price) return;

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    const template = {
        items: [...(invoice.template?.items || [])],
        labour: [...(invoice.template?.labour || [])],
        notes: invoice.template?.notes || ""
    };

    template.items.push({ name, price });

    const updatedInvoice = {
        ...invoice,
        template: template,
        totalCost: (invoice.totalCost || 0) + price
    };

    await fetch(API + "/invoices/" + id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(updatedInvoice)
    });

    openInvoice(id);
}

async function addLabour(id) {

    const name = prompt("Labour description:");
    if (!name) return;

    const price = Number(prompt("Price:"));
    if (!price) return;

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    const template = {
        items: [...(invoice.template?.items || [])],
        labour: [...(invoice.template?.labour || [])],
        notes: invoice.template?.notes || ""
    };

    template.labour.push({ name, price });

    invoice.template = template;
    invoice.totalCost += price;

    await fetch(API + "/invoices/" + id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            template: invoice.template,
            totalCost: invoice.totalCost
        })
    });

    openInvoice(id);
}

async function addNote(id) {

    const note = prompt("Note:");
    if (!note) return;

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    invoice.template ??= { items: [], labour: [], notes: "" };

    invoice.template.notes = note;

    await fetch(API + "/invoices/" + id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(invoice)
    });

    openInvoice(id);
}

async function finaliseInvoice(id) {

    const confirmDone = confirm("Finalise invoice? This cannot be edited.");
    if (!confirmDone) return;

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

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

    const res = await fetch(API + "/invoices/" + id, {
    method: "DELETE"
});

const text = await res.text();
alert(res.status + " - " + text);

loadInvoices();