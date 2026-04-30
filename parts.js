async function loadParts() {

    const res = await fetch(API + "/parts");
    const parts = await res.json();

    // GROUP BY CATEGORY
    const grouped = {};

    parts.forEach(p => {
        const cat = p.category || "Other";

        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });

    let html = `

    <div class="card">
        <div class="title">Add Part</div>

        <input id="partCategory" placeholder="Category (e.g. Engine Oil)">
<input id="partNumber" placeholder="Part Number (e.g. 5W30)">
<input id="partPrice" type="number" placeholder="Price">

        <button class="primary" onclick="createPart()">Save</button>
    </div>

    <div class="card">
        <div class="title">Saved Parts</div>
    `;

    // LOOP CATEGORIES
    Object.keys(grouped).forEach(cat => {

        html += `<div style="margin-bottom:15px;"><b>${cat}</b></div>`;

        grouped[cat].forEach(p => {

            html += `
            <div style="padding-left:10px; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;">
                
                ${p.category} - ${p.partNumber}
                $${p.price || 0}

                <br><br>

                <button onclick="editPart('${p._id}')">Edit</button>
                <button onclick="deletePart('${p._id}')">Delete</button>
            </div>
            `;
        });

    });

    html += `</div>`;

    document.getElementById("partsScreen").innerHTML = html;
}


async function createPart() {

    const part = {
    category: document.getElementById("partCategory").value,
    partNumber: document.getElementById("partNumber").value,
    price: Number(document.getElementById("partPrice").value)
};

    const res = await fetch(API + "/parts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(part)
    });

    alert("status: " + res.status);

    if (!res.ok) {
        const err = await res.text();
        alert("error: " + err);
        return;
    }

    loadParts();
}


async function editPart(id) {

    const res = await fetch(API + "/parts/" + id);
    const part = await res.json();

    const category = prompt("Category:", part.category || "");
    if (category === null) return;

    const price = prompt("Price:", part.price || 0);

    await fetch(API + "/parts/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    category,
    partNumber: part.partNumber,
    price: Number(price)
})
    });

    loadParts();
}


async function deletePart(id) {

    if (!confirm("Delete part?")) return;

    await fetch(API + "/parts/" + id, {
        method: "DELETE"
    });

    loadParts();
}