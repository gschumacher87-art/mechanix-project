// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
    const res = await fetch(API + "/customers");
    const data = await res.json();

    let html = "", options = "";

    data.forEach(c => {
        html += `
        <div class="card" onclick="openCustomer('${c._id}')">
            <b>${c.firstName} ${c.lastName}</b><br>
            ${c.phone}
        </div>`;
        
        options += `<option value="${c._id}">${c.firstName} ${c.lastName}</option>`;
    });

    document.getElementById("customerList").innerHTML = html;
    document.getElementById("vehicleCustomer").innerHTML = options;
}

// ===== ADD CUSTOMER =====
async function addCustomer() {
    await fetch(API + "/customers", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            firstName: custFirstName.value,
            lastName: custLastName.value,
            phone: custPhone.value
        })
    });

    custFirstName.value = "";
    custLastName.value = "";
    custPhone.value = "";

    loadCustomers();
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

    // refresh vehicle list for selected customer
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

// ===== SEARCH CUSTOMERS (BOOKING FLOW) =====
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

    renderBookingResults(results);
}

// ===== RENDER BOOKING RESULTS =====
function renderBookingResults(results) {

    let html = "";

    if (!results.length) {
        html = "<div class='card'>No matches found</div>";
    }

    results.forEach(c => {
        html += `
        <div class="card" onclick="selectCustomer('${c._id}')">
            <b>${c.firstName} ${c.lastName}</b><br>
            ${c.phone}
        </div>`;
    });

    document.getElementById("bookingStepResults").innerHTML = html;
    document.getElementById("bookingStepResults").style.display = "block";
}

// ===== SELECT CUSTOMER (BOOKING FLOW ONLY) =====
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


// ===== OPEN CUSTOMER (CUSTOMER TAB FLOW) =====
async function openCustomer(id) {

    const res = await fetch(API + "/customers/" + id);
    const customer = await res.json();

    const vRes = await fetch(API + "/vehicles");
    const vehicles = await vRes.json();

    const customerVehicles = vehicles.filter(v => String(v.customer) === String(id));

    let vehicleHtml = "";

    if (!customerVehicles.length) {
        vehicleHtml = "<div>No vehicles</div>";
    } else {
        customerVehicles.forEach(v => {
            vehicleHtml += `<div>${v.make} ${v.model}</div>`;
        });
    }

    // TEMP simple detail render (replace later with panel)
    document.getElementById("customerList").innerHTML = `
        <div class="card">
            <b>${customer.firstName} ${customer.lastName}</b><br>
            ${customer.phone}
        </div>

        <div class="card">
            <b>Vehicles</b><br>
            ${vehicleHtml}
        </div>

        <div class="card" onclick="loadCustomers()">
            ← Back
        </div>
    `;
}

window.openCustomer = openCustomer;