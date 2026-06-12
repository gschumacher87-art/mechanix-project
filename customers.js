// ===== LOAD CUSTOMERS =====
async function loadCustomers() {

    document.getElementById("customerList").innerHTML = "";

    document.getElementById("customerList").style.display = "block";

    document.getElementById("customerDetail").style.display = "none";
}

// ===== OPEN CUSTOMER =====
async function openCustomer(id) {

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    const vRes = await fetch(API + "/vehicles?customer=" + id);
    const vehicles = await vRes.json();

    const iRes = await fetch(API + "/invoices?customer=" + id);
    const invoices = await iRes.json();

    let vehicleHtml = "";
    let invoiceHtml = "";

    vehicles.forEach(v => {
    vehicleHtml += `
    <div class="card">
        <b>${v.make || ""} ${v.model || ""}</b><br>
        ${v.buildDate || ""}
        ${v.rego || ""}<br>
        ${v.vin || ""}

<br><br>

<button class="secondary" onclick="editVehicle('${v._id}')">Edit Vehicle</button>

<button class="secondary" onclick="deleteVehicle('${v._id}','${customer._id}')">Delete Vehicle</button>

    </div>`;
});

    if (!vehicleHtml) vehicleHtml = "<div>No vehicles</div>";

    invoices.forEach(i => {
    invoiceHtml += `
    <div class="card" onclick="openSavedInvoice('${i._id}')">

        <b>Invoice #${i.invoiceNumber || "?"}</b>

        <br><br>

        $${i.totalCost || 0}

    </div>
    `;
});

    if (!invoiceHtml) invoiceHtml = "<div>No invoices</div>";

    document.getElementById("customerList").style.display = "none";
    document.getElementById("customerDetail").style.display = "block";

    document.getElementById("customerDetail").innerHTML = `
    <div class="card">
    <div class="title">Customer</div>

    <b>${customer.firstName || ""} ${customer.lastName || ""}</b><br>
    ${customer.phone || ""}

<br><br>

<button class="secondary" onclick="editCustomer('${customer._id}')">Edit Customer</button>

<button class="secondary" onclick="deleteCustomer('${customer._id}')">Delete Customer</button>

</div>
        <div class="card">
        <div class="title">Vehicles</div>

        ${vehicleHtml}
    </div>

    <div class="card">
        <div class="title">Invoices</div>

        ${invoiceHtml}
    </div>

    <div class="card" onclick="loadCustomers()">
        ← Back
    </div>
`;
}

window.openCustomer = openCustomer;


// ===== ADD VEHICLE =====
async function addVehicleToCustomer(customerId) {

    await fetch(API + "/vehicles", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
    customer: customerId,
    make: document.getElementById("newVehicleMake").value,
    model: document.getElementById("newVehicleModel").value,
    buildDate: document.getElementById("newVehicleYearMonth").value,
    rego: document.getElementById("newVehicleRego").value,
    vin: document.getElementById("newVehicleVin").value
})
    });
document.getElementById("newVehicleMake").value = "";
document.getElementById("newVehicleModel").value = "";
document.getElementById("newVehicleYearMonth").value = "";
document.getElementById("newVehicleRego").value = "";
document.getElementById("newVehicleVin").value = "";
    openCustomer(customerId);
}

// ===== LOAD VEHICLES (USED BY BOOKINGS ONLY UI ELEMENT) =====
async function loadVehicles(customerId = null) {
    const res = await fetch(API + "/vehicles?customer=" + customerId);
    const data = await res.json();

    let options = "";

    data.forEach(v => {
        options += `<option value="${v._id}">${v.make} ${v.model} • ${v.rego || ""}</option>`;
    });

    document.getElementById("bookingVehicle").innerHTML = options;
}

// ===== OPEN CUSTOMER SEARCH (UI ONLY) =====
function openCustomerSearch() {
    document.getElementById("customerPopup").style.display = "block";
    document.getElementById("customerPopupList").innerHTML = "";
}

// ===== SHOW ADD CUSTOMER =====
function showAddCustomer() {
    document.getElementById("custFirstName").focus();
}

// ===== SEARCH CUSTOMERS (SINGLE DROPDOWN SEARCH) =====
async function searchCustomers() {

    const value = (document.getElementById("customerSearchInput").value || "").toLowerCase();
    const field = document.getElementById("customerSearchBy").value;

    const res = await fetch(API + "/customers");
    const data = await res.json();

    const filtered = data.filter(c => {
        const v = (c[field] || "").toLowerCase();
        return v.includes(value);
    });

    const list = value ? filtered : [];

    let html = "";

    list.forEach(c => {
        html += `<div class="card" onclick="openCustomer('${c._id}')" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:10px;">
            <div>${c.firstName || ""}</div>
            <div>${c.lastName || ""}</div>
            <div>${c.phone || ""}</div>
            <div>${c.rego || ""}</div>
            <div>${c.vin || ""}</div>
        </div>`;
    });

    document.getElementById("customerList").innerHTML =
    html ||
    "<div class='card'>No customers found</div>";
}

async function editCustomer(id) {

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    const firstName = prompt("First Name", customer.firstName || "");
    if (firstName === null) return;

    const lastName = prompt("Last Name", customer.lastName || "");
    if (lastName === null) return;

    const phone = prompt("Phone", customer.phone || "");
    if (phone === null) return;

    await fetch(API + "/customers/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName,
            lastName,
            phone
        })
    });

    openCustomer(id);
}

async function deleteCustomer(id) {

    if (!confirm("Delete customer?")) return;

    await fetch(API + "/customers/" + id, {
        method: "DELETE"
    });

    loadCustomers();
}

async function editVehicle(id) {

    const res = await fetch(API + "/vehicles/" + id);
    const vehicle = await res.json();

    const make = prompt("Make", vehicle.make || "");
    if (make === null) return;

    const model = prompt("Model", vehicle.model || "");
    if (model === null) return;

    const buildDate = prompt("Build Date", vehicle.buildDate || "");
    if (buildDate === null) return;

    const rego = prompt("Rego", vehicle.rego || "");
    if (rego === null) return;

    const vin = prompt("VIN", vehicle.vin || "");
    if (vin === null) return;

    await fetch(API + "/vehicles/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            make,
            model,
            buildDate,
            rego,
            vin
        })
    });

    const customerId = vehicle.customer || vehicle.customerId;

    if (customerId) {
        openCustomer(customerId);
    }
}

async function deleteVehicle(id, customerId) {

    if (!confirm("Delete vehicle?")) return;

    await fetch(API + "/vehicles/" + id, {
        method: "DELETE"
    });

    openCustomer(customerId);
}

async function openCustomerInvoice(id) {

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    alert(JSON.stringify(invoice, null, 2));
}

async function openSavedInvoice(id) {

    const res = await fetch(API + "/invoices/" + id);
    const invoice = await res.json();

    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));

    document.getElementById("invoiceCard")
        .classList.add("active");

    document.getElementById("invoiceFirstName").value =
        invoice.customer?.firstName || "";

    document.getElementById("invoiceLastName").value =
        invoice.customer?.lastName || "";

    document.getElementById("invoicePhone").value =
        invoice.customer?.phone || "";

    document.getElementById("invoiceEmail").value =
        invoice.customer?.email || "";

    document.getElementById("invoiceRego").value =
        invoice.vehicle?.rego || "";

    document.getElementById("invoiceVin").value =
        invoice.vehicle?.vin || "";

    document.getElementById("invoiceMake").value =
        invoice.vehicle?.make || "";

    document.getElementById("invoiceModel").value =
        invoice.vehicle?.model || "";

    document.getElementById("invoiceBuildDate").value =
        invoice.vehicle?.buildDate || "";

    document.getElementById("invoiceOdometer").value =
        invoice.vehicle?.odometer || "";
}