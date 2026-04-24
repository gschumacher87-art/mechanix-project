// ===== STATE =====
window.templatesCache = [];
window.editingTemplateId = null;
window.selectedJobIndex = null;

// ===== OPEN FROM JOB =====
function openTemplatePopup(i) {
    window.selectedJobIndex = i;
    openTemplateModal();
}

// ===== MODAL CONTROL =====
function openTemplateModal() {
    document.getElementById("templateModal").style.display = "block";
    loadTemplates();
}

function closeTemplateModal() {
    document.getElementById("templateModal").style.display = "none";
    window.editingTemplateId = null;
}

// ===== LOAD + RENDER LIST =====
async function loadTemplates() {
    const res = await fetch(API + "/templates");
    const data = await res.json();

    window.templatesCache = data;

    let html = `
        <div class="card">
            <input id="newTemplateName" placeholder="New template name">
            <button onclick="createTemplate()">Create</button>
        </div>
    `;

    data.forEach(t => {
        html += `
        <div class="card" onclick="useTemplate('${t._id}')">
            <b>${t.name}</b>

            <div style="margin-top:8px;">
                <button onclick="event.stopPropagation(); editTemplate('${t._id}')">Edit</button>
                <button onclick="event.stopPropagation(); deleteTemplate('${t._id}')">Delete</button>
            </div>
        </div>
        `;
    });

    const el1 = document.getElementById("templateList");
    if (el1) el1.innerHTML = html;

    const el2 = document.getElementById("templateListModal");
    if (el2) el2.innerHTML = html;
}

// ===== CREATE =====
async function createTemplate() {
    const name = document.getElementById("newTemplateName").value;
    if (!name) return;

    await fetch(API + "/templates", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description: "" })
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

// ===== EDIT VIEW =====
function editTemplate(id) {
    const t = window.templatesCache.find(x => x._id === id);
    if (!t) return;

    window.editingTemplateId = id;

    const html = `
        <div class="card">
            <div class="title">Edit Template</div>
            <input id="templateName" value="${t.name || ""}">
            <textarea id="templateDesc">${t.description || ""}</textarea>
            <button onclick="saveTemplate()">Save</button>
            <button onclick="loadTemplates()">Cancel</button>
        </div>
    `;

    // Update BOTH if they exist, or just the one currently visible
    const modalEl = document.getElementById("templateListModal");
    const listEl = document.getElementById("templateList");
    
    if (modalEl) modalEl.innerHTML = html;
    else if (listEl) listEl.innerHTML = html;
}

// ===== SAVE (CREATE OR UPDATE) =====
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

    loadTemplates();
}

// ===== APPLY TEMPLATE TO JOB =====
function useTemplate(id) {
    const t = window.templatesCache.find(x => x._id === id);
    if (!t) return;

    const i = window.selectedJobIndex;
    if (i === null) return;

    jobs[i].summary = t.name || "";
    jobs[i].description = t.description || "";

    closeTemplateModal();
    renderJobs();
}

// ===== CHECKLIST HELPER =====
function getTemplateChecklistByName(name) {
    if (!window.templatesCache) return null;

    const t = window.templatesCache.find(x =>
        x.name.toLowerCase() === name.toLowerCase()
    );

    if (!t || !t.description) return null;

    return t.description.split("\n").map(line => ({
        text: line.trim(),
        done: false
    })).filter(x => x.text);
}