let templates = [];

// ===== LOAD =====
async function loadTemplates() {

    const res = await fetch(API + "/templates");
    templates = await res.json();

    let html = "";

    templates.forEach(t => {
        html += `
<div class="card">
    <b>${t.name}</b>
    <button onclick="deleteTemplate('${t._id}')">Delete</button>
</div>
`;
    });

    const el = document.getElementById("templateList");
    if (el) el.innerHTML = html;
}

// ===== CREATE =====
async function createTemplate() {

    const name = document.getElementById("templateName").value.trim();

    if (!name) return;

    await fetch(API + "/templates", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name
        })
    });

    document.getElementById("templateName").value = "";

    loadTemplates();
}

// ===== DELETE =====
async function deleteTemplate(id) {

    await fetch(API + "/templates/" + id, {
        method: "DELETE"
    });

    loadTemplates();
}

// ===== CHECK JOB SUMMARY =====
function getTemplateBySummary(summary) {

    if (!summary) return null;

    return templates.find(t =>
        (t.name || "").toLowerCase().trim() ===
        summary.toLowerCase().trim()
    ) || null;
}