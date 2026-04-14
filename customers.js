// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
    const res = await fetch(API + "/customers");
    const data = await res.json();

    let html = "", options = "";

    data.forEach(c => {
        html += `<div class="card" onclick="openCustomer('${c._id}')">
            ${c.firstName} ${c.lastName} - ${c.phone}
        </div>`;
        options += `<option value="${c._id}">${c.firstName} ${c.lastName}</option>`;
    });

    document.getElementById("customerList").innerHTML = html;

    // ensure list visible
    document.getElementById("customerList").style.display = "block";
    document.getElementById("customerDetail").style.display = "none";
}

// ===== ADD VEHICLE =====
async function addVehicle() {
    await fetch(API + "/vehicles", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            customer: vehicleCustomer.value,
            make: vehicleMake.value,
            model: vehicleModel.value
        })
    });

    vehicleMake.value = "";
    vehicleModel.value = "";

    loadVehicles(vehicleCustomer.value);
}

// ===== LOAD VEHICLES =====
async function loadVehicles(customerId = null) {
    const res = await fetch(API + "/vehicles");
    const data = await res.json();

    let options = "";

    data.forEach(v => {
        if (!customerId || String(v.customer) === String(customerId)) {
            options += `<option value="${v._id}">${v.make} ${v.model}</option>`;
        }
    });

    document.getElementById("bookingVehicle").innerHTML = options;
}

// ===== SEARCH CUSTOMERS =====
async function searchCustomers() {

    const first = (searchFirstName.value || "").toLowerCase();
    const last = (searchLastName.value || "").toLowerCase();
    const phone = searchPhone.value || "";
    const rego = (searchRego.value || "").toLowerCase();

    const res = await fetch(API + "/customers");
    const customers = await res.json();

    const vRes = await fetch(API + "/vehicles");
    const vehicles = await vRes.json();

    let results = [];

    customers.forEach(c => {

        const cFirst = (c.firstName || "").toLowerCase();
        const cLast = (c.lastName || "").toLowerCase();
        const cPhone = c.phone || "";

        const matchCustomer =
            (!first || cFirst.includes(first)) &&
            (!last || cLast.includes(last)) &&
            (!phone || cPhone.includes(phone));

        let matchVehicle = false;

        if (rego) {
            const v = vehicles.find(v =>
                String(v.customer) === String(c._id) &&
                (v.rego || "").toLowerCase().includes(rego)
            );
            if (v) matchVehicle = true;
        }

        if (matchCustomer || matchVehicle) {
            results.push(c);
        }
    });

    renderBookingResults(results, "customer");
}

// ===== RENDER BOOKING RESULTS =====//
function renderBookingResults(results, mode = "booking") {

    let html = "";

    if (!results.length) {
        html = "<div class='card'>No matches found</div>";
    }

    results.forEach(c => {

        let click = "";

        if (mode === "booking") {
            click = `selectCustomer('${c._id}')`;
        } else {
            click = `openCustomer('${c._id}')`;
        }

        html += `
        <div class="card" onclick="${click}">
            <b>${c.firstName} ${c.lastName}</b><br>
            ${c.phone}
        </div>`;
    });

    document.getElementById("bookingStepResults").innerHTML = html;
    document.getElementById("bookingStepResults").style.display = "block";
}

// ===== SELECT CUSTOMER (BOOKING FLOW) =====
async function selectCustomer(id) {

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    document.getElementById("bookingStepSearch").style.display = "none";
    document.getElementById("bookingStepResults").style.display = "none";
    document.getElementById("bookingStepDetails").style.display = "block";

    document.getElementById("selectedCustomer").innerHTML = `
        <b>${customer.firstName} ${customer.lastName}</b><br>
        ${customer.phone}
    `;

    loadVehicles(id);
}

window.selectCustomer = selectCustomer;


// ===== OPEN CUSTOMER (PROPER DETAIL VIEW) =====
async function openCustomer(id) {

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    const vRes = await fetch(API + "/vehicles");
    const vehicles = await vRes.json();

    let vehicleHtml = "";

    vehicles
        .filter(v => String(v.customer) === String(id))
        .forEach(v => {
            vehicleHtml += `<div class="card">${v.make} ${v.model}</div>`;
        });

    if (!vehicleHtml) vehicleHtml = "<div>No vehicles</div>";

    // switch views
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

    openCustomer(id); // reload updated view
}

// ===== OPEN CUSTOMER SEARCH =====
function openCustomerSearch() {

    // reuse booking modal search
    document.getElementById("bookingModal").style.display = "block";

    document.getElementById("bookingStepSearch").style.display = "block";
    document.getElementById("bookingStepResults").style.display = "none";
    document.getElementById("bookingStepDetails").style.display = "none";
}

// ===== SHOW ADD CUSTOMER =====
function showAddCustomer() {

    // scroll to form (simple + safe)
    document.getElementById("custFirstName").focus();
}

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

    openCustomer(customerId); // reload with new vehicle
}