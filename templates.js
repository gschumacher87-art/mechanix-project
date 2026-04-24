function openTemplatePopup(i) {
    window.selectedJobIndex = i;
    document.getElementById("templateModal").style.display = "block";
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
    <div class="card">
    <b onclick="editTemplate('${t._id}')">${t.name}</b>
    <button onclick="deleteTemplate('${t._id}')">Delete</button>
</div>
`;
    });

    const el1 = document.getElementById("templateList");
if (el1) el1.innerHTML = html;

const el2 = document.getElementById("templateListModal");
if (el2) el2.innerHTML = html;
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
    loadTemplates();
}

function closeTemplateModal() {
    document.getElementById("templateModal").style.display = "none";
}

async function saveTemplate() {

    const name = document.getElementById("templateName").value;
    const description = document.getElementById("templateDesc").value;

    if (!name) return;

    const method = window.editingTemplateId ? "PUT" : "POST";
    const url = window.editingTemplateId
        ? API + "/templates/" + window.editingTemplateId
        : API + "/templates";

    await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description })
    });

    window.editingTemplateId = null;

    closeTemplateModal();
    loadTemplates();
}

function useTemplate(id) {

    const t = window.templatesCache.find(x => x._id === id);

    if (!t) return;

   const i = window.selectedJobIndex;

jobs[i].summary = t.name || "";
jobs[i].description = t.description || "";

closeTemplateModal();
renderJobs();
}

function getTemplateChecklistByName(name) {

    if (!window.templatesCache) return null;

    const t = window.templatesCache.find(x =>
        x.name.toLowerCase() === name.toLowerCase()
    );

    if (!t || !t.description) return null;

    // TURN DESCRIPTION INTO CHECKLIST (line by line)
    return t.description.split("\n").map(line => ({
        text: line.trim(),
        done: false
    })).filter(x => x.text);
}

async function editTemplate(id) {

    const t = window.templatesCache.find(x => x._id === id);
    if (!t) return;

    document.getElementById("templateName").value = t.name || "";
    document.getElementById("templateDesc").value = t.description || "";

    window.editingTemplateId = id;

    document.getElementById("templateModal").style.display = "block";
}