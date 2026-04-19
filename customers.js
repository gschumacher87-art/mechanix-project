// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
    const res = await fetch(API + "/customers");
    const data = await res.json();

    let html = "";

    data.forEach(c => {
        html += `<div class="card" onclick="openCustomer('${c._id}')" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:10px;">
            <div>${c.firstName || ""}</div>
            <div>${c.lastName || ""}</div>
            <div>${c.phone || ""}</div>
            <div>${c.rego || ""}</div>
            <div>${c.vin || ""}</div>
        </div>`;
    });

    document.getElementById("customerList").innerHTML = html;
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
    <div class="card" onclick="editVehicle('${v._id}')">
        <b>${v.make || ""} ${v.model || ""}</b><br>
        ${v.yearMonth || ""}<br>
        ${v.rego || ""}<br>
        ${v.vin || ""}
    </div>`;
});

    if (!vehicleHtml) vehicleHtml = "<div>No vehicles</div>";

    invoices.forEach(i => {
    invoiceHtml += `<div class="card" onclick="openInvoice('${i._id}')">$${i.totalCost || 0}</div>`;
});

    if (!invoiceHtml) invoiceHtml = "<div>No invoices</div>";

    document.getElementById("customerList").style.display = "none";
    document.getElementById("customerDetail").style.display = "block";

    document.getElementById("customerDetail").innerHTML = `
    <div class="card" onclick="editCustomer('${customer._id}')">
    <div class="title">Customer</div>

    <b>${customer.firstName || ""} ${customer.lastName || ""}</b><br>
    ${customer.phone || ""}
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
    yearMonth: document.getElementById("newVehicleYearMonth").value,
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

    const list = value ? filtered : data;

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

    document.getElementById("customerList").innerHTML = html;
}

function editCustomer(id) {
    alert("Edit customer coming next");
}

function editVehicle(id) {
    alert("Edit vehicle coming next");
}