function openTemplatePopup() {
    loadTemplates();
}

// ===== LOAD + RENDER =====
async function loadTemplates() {
    const res = await fetch(API + "/templates");

    const data = await res.json();
window.templatesCache = data;

    let html = "";
    data.forEach(t => {
        html += `
    <div class="card" onclick="useTemplate('${t._id}')">
        <b>${t.name}</b>
        <button onclick="deleteTemplate('${t._id}')">Delete</button>
    </div>
`;
    });

    document.getElementById("templateList").innerHTML = html;
}

// ===== CREATE =====
async function createTemplate(name) {
    if (!name) return;

    await fetch(API + "/templates", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
    });

    loadTemplates();
}

// ===== DELETE =====
async function deleteTemplate(id) {
    await fetch(API + "/templates/" + id, {
    method: "DELETE"
});

    loadTemplates();
}

function openTemplateModal() {
    document.getElementById("templateModal").style.display = "block";
}

function closeTemplateModal() {
    document.getElementById("templateModal").style.display = "none";
}

async function saveTemplate() {
    const name = document.getElementById("templateName").value;
    const description = document.getElementById("templateDesc").value;

    if (!name) return;

    await fetch(API + "/templates", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, description })
});

    closeTemplateModal();
    loadTemplates();
}

function useTemplate(id) {

    const t = window.templatesCache.find(x => x._id === id);

    if (!t) return;

    if (window.jobs && window.jobs.length) {

        window.jobs[0].summary = t.name || "";
        window.jobs[0].description = t.description || "";

        renderJobs();
    }

    closeTemplateModal();
}