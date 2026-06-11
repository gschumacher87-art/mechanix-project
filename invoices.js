let currentInvoice = null;

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
    await fetch(API + "/invoices", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            job: currentInvoice._id,
            customer: customer._id,
            vehicle: vehicle._id,
            status: "unpaid"
        })
    });

    // REMOVE PENDING JOB
    await fetch(API + "/jobs/" + currentInvoice._id, {
        method: "DELETE"
    });

    show("invoices");

    loadInvoices();
}
async function deletePendingInvoice(id) {

    if (!confirm("Delete pending invoice?")) return;

    await fetch(API + "/jobs/" + id, {
        method: "DELETE"
    });

    loadInvoices();
}