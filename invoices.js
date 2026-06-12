let currentInvoice = null;

let invoiceLabour = [];
let invoiceParts = [];

async function loadInvoices() {

    const res = await fetch(API + "/jobs");
    const jobs = await res.json();

    const pendingJobs = jobs.filter(
        j => j.status === "pending-invoice"
    );

    document.getElementById("invoiceList").innerHTML =
        pendingJobs.map(j => `

<div class="card">

    <b>${j.rego || ""}</b><br>

    ${j.make || ""} ${j.model || ""}<br><br>

    <b>${
        j.customerName ||
        (
            j.customer
                ? `${j.customer.firstName || ""} ${j.customer.lastName || ""}`
                : ""
        )
    }</b>

    <br><br>

    ${
        (j.jobs || [])
            .filter(x => x.status === "done")
            .map(x => `• ${x.summary}`)
            .join("<br>")
    }

    <br><br>

    <button class="secondary" onclick="openInvoice('${j._id}')">
        Open
    </button>

    <button class="secondary" onclick="deletePendingInvoice('${j._id}')">
        Delete
    </button>

</div>

`).join("") || "<div class='card'>No pending invoices</div>";
}

async function openInvoice(id) {

    const res = await fetch(API + "/jobs/" + id);

    currentInvoice = await res.json();

    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));

    document.getElementById("invoiceCard")
        .classList.add("active");

    const customerName = currentInvoice.customerName || "";

const parts = customerName.trim().split(" ");

document.getElementById("invoiceFirstName").value =
    parts[0] || "";

document.getElementById("invoiceLastName").value =
    parts.slice(1).join(" ") || "";

    document.getElementById("invoicePhone").value =
        currentInvoice.phone || "";

    document.getElementById("invoiceEmail").value =
        currentInvoice.customer?.email || "";

    document.getElementById("invoiceRego").value =
        currentInvoice.rego || "";

    document.getElementById("invoiceVin").value =
        currentInvoice.vehicle?.vin || "";

    document.getElementById("invoiceMake").value =
        currentInvoice.make || "";

    document.getElementById("invoiceModel").value =
        currentInvoice.model || "";

    document.getElementById("invoiceBuildDate").value =
        currentInvoice.buildDate || "";

    document.getElementById("invoiceOdometer").value =
    currentInvoice.vehicle?.odometer || "";

invoiceLabour = [];
invoiceParts = [];

renderInvoiceLines();
}

function addInvoiceLabour() {

    invoiceLabour.push({
        description: "",
        hours: 1,
        rate: 100
    });

    renderInvoiceLines();
}

function addInvoicePart() {

    invoiceParts.push({
        description: "",
        partNumber: "",
        qty: 1,
        price: 0
    });

    renderInvoiceLines();
}

function renderInvoiceLines() {

    document.getElementById("invoiceParts").innerHTML =
    invoiceParts.map((p, i) => `

<div style="display:grid;grid-template-columns:3fr 2fr 80px 120px;gap:10px;margin-bottom:10px;">

<input
value="${p.description || ""}"
placeholder="Part Description"
oninput="invoiceParts[${i}].description=this.value;updateInvoiceTotals();">

<input
value="${p.partNumber || ""}"
placeholder="Part Number"
oninput="invoiceParts[${i}].partNumber=this.value;updateInvoiceTotals();">

<input
type="number"
value="${p.qty}"
placeholder="Qty"
oninput="invoiceParts[${i}].qty=parseFloat(this.value)||0;updateInvoiceTotals();">

<input
type="number"
value="${p.price}"
placeholder="Price"
oninput="invoiceParts[${i}].price=parseFloat(this.value)||0;updateInvoiceTotals();">

</div>

`).join("");

    document.getElementById("invoiceLabour").innerHTML =
        invoiceLabour.map((l, i) => `

<div style="display:flex;gap:10px;margin-bottom:10px;">

<input
value="${l.description}"
placeholder="Labour Description"
oninput="invoiceLabour[${i}].description=this.value;updateInvoiceTotals();">

<input
type="number"
value="${l.hours}"
placeholder="Hours"
oninput="invoiceLabour[${i}].hours=parseFloat(this.value)||0;updateInvoiceTotals();">

<input
type="number"
value="${l.rate}"
placeholder="Rate"
oninput="invoiceLabour[${i}].rate=parseFloat(this.value)||0;updateInvoiceTotals();">

</div>

`).join("");

    updateInvoiceTotals();
}

function updateInvoiceTotals() {

    const partsTotal =
        invoiceParts.reduce(
            (t, p) => t + (p.qty * p.price),
            0
        );

    const labourTotal =
        invoiceLabour.reduce(
            (t, l) => t + (l.hours * l.rate),
            0
        );

    const invoiceTotal =
        partsTotal + labourTotal;

    document.getElementById("partsTotal").textContent =
        partsTotal.toFixed(2);

    document.getElementById("labourTotal").textContent =
        labourTotal.toFixed(2);

    document.getElementById("invoiceTotal").textContent =
        invoiceTotal.toFixed(2);

}
function saveInvoice() {
    alert("Save later");
}

async function finaliseInvoice() {

    if (!confirm("Finalise Invoice?")) return;

    const firstName =
        document.getElementById("invoiceFirstName").value.trim();

    const lastName =
        document.getElementById("invoiceLastName").value.trim();

    const phone =
        document.getElementById("invoicePhone").value.trim();

    const email =
        document.getElementById("invoiceEmail").value.trim();

    const rego =
        document.getElementById("invoiceRego").value.trim();

    const vin =
        document.getElementById("invoiceVin").value.trim();

    const make =
        document.getElementById("invoiceMake").value.trim();

    const model =
        document.getElementById("invoiceModel").value.trim();

    const buildDate =
        document.getElementById("invoiceBuildDate").value.trim();

    const odometer =
        parseInt(document.getElementById("invoiceOdometer").value) || 0;

    // FIND CUSTOMER
    const customersRes = await fetch(API + "/customers");
    const customers = await customersRes.json();

    let customer = customers.find(c =>
        (c.phone || "").trim() === phone
    );

    // CREATE CUSTOMER
    if (!customer) {

        const createCustomerRes = await fetch(API + "/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName,
                lastName,
                phone,
                email
            })
        });

        customer = await createCustomerRes.json();
    }

    // FIND VEHICLE
    const vehiclesRes = await fetch(API + "/vehicles");
    const vehicles = await vehiclesRes.json();

    let vehicle = vehicles.find(v =>
        (v.rego || "").trim().toLowerCase() ===
        rego.trim().toLowerCase()
    );

    // CREATE VEHICLE
    if (!vehicle) {

        const createVehicleRes = await fetch(API + "/vehicles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer: customer._id,
                make,
                model,
                buildDate,
                odometer,
                rego,
                vin
            })
        });

        vehicle = await createVehicleRes.json();
    }

    // CREATE INVOICE
    // CREATE INVOICE
const invoiceRes = await fetch(API + "/invoices", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        job: currentInvoice._id,
        customer: customer._id,
        vehicle: vehicle._id,
        labour: invoiceLabour,
        parts: invoiceParts,
        status: "unpaid"
    })
});

const savedInvoice = await invoiceRes.json();

show("customers");

return;

    // REMOVE PENDING JOB
    await fetch(API + "/jobs/" + currentInvoice._id, {
        method: "DELETE"
    });

}
async function deletePendingInvoice(id) {

    if (!confirm("Delete pending invoice?")) return;

    await fetch(API + "/jobs/" + id, {
        method: "DELETE"
    });

    loadInvoices();
}
