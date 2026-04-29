const express = require("express");
const router = express.Router();
const Part = require("../models/Part");
const auth = require("../middleware/auth");

// NORMALISE
function formatCategory(name) {
    return (name || "")
        .toLowerCase()
        .trim()
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

// CREATE / ADD PART
router.post("/", auth, async (req, res) => {
    try {

        const name = formatCategory(req.body.name);

        const part = new Part({
            category: name,
            name: name,
            partNumber: req.body.partNumber,
            price: req.body.price || 0
        });

        await part.save();
        res.json(part);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// SEARCH PARTS
router.get("/", auth, async (req, res) => {
    try {

        const q = (req.query.q || "").toLowerCase();

        const parts = await Part.find();

        const filtered = parts.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.partNumber.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );

        res.json(filtered);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE PRICE / EDIT
router.put("/:id", auth, async (req, res) => {
    try {

        const part = await Part.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(part);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;