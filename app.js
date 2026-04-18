if (!localStorage.getItem("token")) {
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("loginScreen").style.display = "block";
        document.getElementById("app").style.display = "none";
    });
} else {
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("app").style.display = "block";
    });
}

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
    if (id === "templates" && typeof loadTemplates === "function") loadTemplates();
}

async function login() {
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
    location.reload();
}

if (localStorage.getItem("token")) {
    show('bookings');
}

// ================= INTRO ANIMATION =================
if (!localStorage.getItem("token")) {

    setTimeout(() => {
        const w = document.getElementById("lineW");
        const m = document.getElementById("lineM");
        const s = document.getElementById("lineS");

        if (!w || !m || !s) return;

        w.innerText = "WORKSHOP";
        w.classList.add("expand");

        m.innerText = "MANAGEMENT";
        m.classList.add("expand");

        s.innerText = "SOFTWARE";
        s.classList.add("expand");

    }, 1800);

}