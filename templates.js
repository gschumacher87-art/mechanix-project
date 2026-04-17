const API = "https://mechanix-api-87.onrender.com/api";

// ===== OPEN POPUP =====
function openTemplatePopup() {
    loadTemplates();
    alert("Template system ready (UI next)");
}

// ===== LOAD =====
async function loadTemplates() {
    const res = await fetch(API + "/templates", {
        headers: {
            Authorization: localStorage.getItem("token")
        }
    });

    const data = await res.json();
    console.log("Templates:", data);
}

// ===== CREATE =====
async function createTemplate(name) {
    const res = await fetch(API + "/templates", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token")
        },
        body: JSON.stringify({ name })
    });

    const data = await res.json();
    console.log("Created:", data);
}