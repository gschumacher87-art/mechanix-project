async function loadParts() {

    alert("loadParts running");

    const res = await fetch(API + "/parts");
    alert("status: " + res.status);

    const parts = await res.json();
    alert("parts: " + parts.length);

    let html = `

    <div class="card">
        <div class="title">Add Part</div>

        <input id="partCategory" placeholder="Category (e.g. Engine Oil)">
        <input id="partName" placeholder="Item (e.g. 5W30 / WCO5)">
        <input id="partPrice" type="number" placeholder="Price">

        <button class="primary" onclick="createPart()">Save</button>
    </div>

    <div class="card">
        <div class="title">Saved Parts</div>
    `;

    parts.forEach(p => {
        html += `
        <div style="border-bottom:1px solid #eee; padding:10px 0;">
            <b>${p.category || ""}</b><br>
            ${p.name || ""}<br>
            $${p.price || 0}

            <br><br>

            <button onclick="editPart('${p._id}')">Edit</button>
            <button onclick="deletePart('${p._id}')">Delete</button>
        </div>
        `;
    });

    html += `</div>`;

    document.getElementById("partsScreen").innerHTML = html;
}


async function createPart() {

    const part = {
        category: document.getElementById("partCategory").value,
        name: document.getElementById("partName").value,
        price: Number(document.getElementById("partPrice").value)
    };

    if (!part.category || !part.name) return;

    await fetch(API + "/parts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(part)
    });

    loadParts();
}


async function editPart(id) {

    const res = await fetch(API + "/parts/" + id);
    const part = await res.json();

    const category = prompt("Category:", part.category || "");
    if (category === null) return;

    const name = prompt("Item:", part.name || "");
    if (name === null) return;

    const price = prompt("Price:", part.price || 0);

    await fetch(API + "/parts/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            category,
            name,
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