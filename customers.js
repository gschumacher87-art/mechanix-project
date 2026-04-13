async function loadCustomers() {
    const res = await fetch(API + "/customers");
    const data = await res.json();

    let html = "", options = "";
        
    data.forEach(c => {
        html += `<div class="card">${c.firstName} ${c.lastName} - ${c.phone}</div>`;
        options += `<option value="${c._id}">${c.firstName} ${c.lastName}</option>`;
    });

    customerList.innerHTML = html;
    vehicleCustomer.innerHTML = options;
}

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

async function loadVehicles(customerId = null) {
    const res = await fetch(API + "/vehicles");
    const data = await res.json();

    let options = "";

    data.forEach(v => {
        if (!customerId || v.customer === customerId) {
            options += `<option value="${v._id}">${v.make} ${v.model}</option>`;
        }
    });

    bookingVehicle.innerHTML = options;
}