const API = "https://mechanix-api-87.onrender.com/api";

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