function loadParts() {
    document.getElementById("partsScreen").innerHTML = `

    <div class="card">
        <div class="title">Parts</div>

        <input id="partCategory" placeholder="Category (e.g. Engine Oil)">
<input id="partName" placeholder="Item (e.g. 5W30 / WCO5)">
<input id="partPrice" type="number" placeholder="Price">

        <button class="primary">Save</button>
    </div>

    <div class="card">
        <div class="title">Saved Parts</div>
        <div style="color:#777;">No parts yet</div>
    </div>

    `;
}