let repairTypes = [];
let currentRepairType = null;

// ================= LOAD =================
async function loadTemplates() {

    const res = await fetch(API + "/templates");
    repairTypes = await res.json();

    let html = "";

    repairTypes.forEach(t => {

        html += `
<div class="card">

    <b onclick="editRepairType('${t._id}')"
       style="cursor:pointer;">
        ${t.summaryMatch || ""}
    </b>

    <button onclick="deleteTemplate('${t._id}')">
        Delete
    </button>

</div>
`;
    });

    document.getElementById("templateList").innerHTML = html;
}

// ================= NEW =================
function newRepairType() {

    currentRepairType = {
        summaryMatch: "",
        steps: []
    };

    document.getElementById("summaryMatch").value = "";
    document.getElementById("repairSteps").innerHTML = "";

    document.getElementById("createTemplateModal").style.display = "block";
}

// ================= EDIT =================
function editRepairType(id) {

    currentRepairType =
        repairTypes.find(x => x._id === id);

    document.getElementById("summaryMatch").value =
        currentRepairType.summaryMatch || "";

    renderRepairSteps();

    document.getElementById("createTemplateModal").style.display = "block";
}

// ================= RENDER =================
function renderRepairSteps() {

    let html = "";

    (currentRepairType.steps || []).forEach((step, i) => {

        html += `
<div class="card">

    <input
        value="${step.text || ""}"
        oninput="currentRepairType.steps[${i}].text=this.value">

    <label>
        <input
            type="checkbox"
            ${step.photoRequired ? "checked" : ""}
            onchange="currentRepairType.steps[${i}].photoRequired=this.checked">

        Photo Required
    </label>

    <button onclick="deleteRepairStep(${i})">
        Delete
    </button>

</div>
`;
    });

    document.getElementById("repairSteps").innerHTML = html;
}

// ================= ADD STEP =================
function addRepairStep() {

    if (!currentRepairType) {
        currentRepairType = {
            summaryMatch: "",
            steps: []
        };
    }

    currentRepairType.steps.push({
        text: "",
        photoRequired: false
    });

    renderRepairSteps();
}

// ================= DELETE STEP =================
function deleteRepairStep(i) {

    currentRepairType.steps.splice(i, 1);

    renderRepairSteps();
}

// ================= SAVE =================
async function saveRepairType() {

    if (!currentRepairType) return;

    currentRepairType.summaryMatch =
        document.getElementById("summaryMatch").value.trim();

    if (!currentRepairType.summaryMatch) return;

    const method =
        currentRepairType._id ? "PUT" : "POST";

    const url =
        currentRepairType._id
            ? API + "/templates/" + currentRepairType._id
            : API + "/templates";

    await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(currentRepairType)
    });

    document.getElementById("createTemplateModal").style.display = "none";

    currentRepairType = null;

    loadTemplates();
}

// ================= DELETE =================
async function deleteTemplate(id) {

    await fetch(API + "/templates/" + id, {
        method: "DELETE"
    });

    loadTemplates();
}

// ================= OPEN CREATE =================
document.addEventListener("DOMContentLoaded", () => {

    const btn = document.querySelector(
        "#templates .primary"
    );

    if (btn) {
        btn.onclick = newRepairType;
    }

    loadTemplates();
});