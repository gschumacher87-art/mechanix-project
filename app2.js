alert("APP2 LOADED");

console.log("FETCH OVERRIDE LOADED");
const API = "https://mechanix-api-87.onrender.com/api";

const originalFetch = window.fetch;

window.fetch = function(url, options = {}) {

    options = options || {};

    const token = localStorage.getItem("token");

    options.headers = {
        ...(options.headers || {}),
        ...(token && { Authorization: "Bearer " + token })
    };

    return originalFetch(url, options);
};

async function show(id, btn) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    if (id === "bookings" && typeof loadBookings === "function") loadBookings();
    if (id === "jobs" && typeof loadJobs === "function") loadJobs();
    if (id === "customers" && typeof loadCustomers === "function") loadCustomers();
    if (id === "invoices" && typeof loadInvoices === "function") loadInvoices();
}

async function testLogin() {
    const res = await fetch(API + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: "admin@test.com",
            password: "123456"
        })
    });

    const data = await res.json();

    localStorage.setItem("token", data.token);
loadBookings();

    alert("TOKEN SAVED");
}

window.onload = () => {
    if (localStorage.getItem("token")) loadBookings();
};