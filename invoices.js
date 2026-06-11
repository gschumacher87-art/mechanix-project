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
async function deletePendingInvoice(id) {

    if (!confirm("Delete pending invoice?")) return;

    await fetch(API + "/jobs/" + id, {
        method: "DELETE"
    });

    loadInvoices();
}
