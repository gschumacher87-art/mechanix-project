// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
    const res = await fetch(API + "/customers");
    const data = await res.json();

    let html = "";

    data.forEach(c => {
        html += `<div class="card" onclick="openCustomer('${c._id}')">
            ${c.firstName} ${c.lastName} - ${c.phone}
        </div>`;
    });

    document.getElementById("customerList").innerHTML = html;
    document.getElementById("customerList").style.display = "block";
    document.getElementById("customerDetail").style.display = "none";
}

// ===== SEARCH CUSTOMERS (CUSTOMERS ONLY) =====
function searchCustomers() {

    const q = (document.getElementById("customerSearchInput").value || "").toLowerCase();

    const cards = document.querySelectorAll("#customerList .card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(q) ? "block" : "none";
    });
}

// ===== OPEN CUSTOMER =====
async function openCustomer(id) {

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    const vRes = await fetch(API + "/vehicles?customer=" + id);
    const vehicles = await vRes.json();

    let vehicleHtml = "";

    vehicles.forEach(v => {
        vehicleHtml += `<div class="card">${v.make} ${v.model}</div>`;
    });

    if (!vehicleHtml) vehicleHtml = "<div>No vehicles</div>";

    document.getElementById("customerList").style.display = "none";
    document.getElementById("customerDetail").style.display = "block";

    document.getElementById("customerDetail").innerHTML = `
    <div class="card">
        <div class="title">Customer</div>

        <input id="editFirstName" value="${customer.firstName}">
        <input id="editLastName" value="${customer.lastName}">
        <input id="editPhone" value="${customer.phone}">

        <button class="primary" onclick="saveCustomer('${customer._id}')">
            Save
        </button>
    </div>

    <div class="card">
        <div class="title">Vehicles</div>

        ${vehicleHtml}

        <input id="newVehicleMake" placeholder="Make">
        <input id="newVehicleModel" placeholder="Model">

        <button class="primary" onclick="addVehicleToCustomer('${customer._id}')">
            + Add Vehicle
        </button>
    </div>

    <div class="card" onclick="loadCustomers()">
        ← Back
    </div>
`;
}

window.openCustomer = openCustomer;

// ===== SAVE CUSTOMER =====
async function saveCustomer(id) {

    await fetch(API + "/customers/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: document.getElementById("editFirstName").value,
            lastName: document.getElementById("editLastName").value,
            phone: document.getElementById("editPhone").value
        })
    });

    openCustomer(id);
}

// ===== ADD VEHICLE =====
async function addVehicleToCustomer(customerId) {

    await fetch(API + "/vehicles", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            customer: customerId,
            make: document.getElementById("newVehicleMake").value,
            model: document.getElementById("newVehicleModel").value
        })
    });

    openCustomer(customerId);
}

// ===== LOAD VEHICLES (USED BY BOOKINGS ONLY UI ELEMENT) =====
async function loadVehicles(customerId = null) {
    const res = await fetch(API + "/vehicles?customer=" + customerId);
    const data = await res.json();

    let options = "";

    data.forEach(v => {
        options += `<option value="${v._id}">${v.make} ${v.model}</option>`;
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

document.addEventListener("input", function(e) {
    if (e.target.id === "customerSearchInput") {
        searchCustomers();
    }
});