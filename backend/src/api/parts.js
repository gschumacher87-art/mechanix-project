const express = require("express");
const router = express.Router();
const Part = require("../models/Part");
const auth = require("../middleware/auth");

// NORMALISE (CASE INSENSITIVE, CLEAN)
function formatCategory(name) {
    return (name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

// CREATE / ADD PART
router.post("/", auth, async (req, res) => {
    try {

        const category = formatCategory(req.body.category);

        const part = new Part({
    category: category,
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
            (p.partNumber || "").toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q)
        );

        res.json(filtered);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE PART
router.get("/:id", auth, async (req, res) => {
    try {
        const part = await Part.findById(req.params.id);
        if (!part) return res.status(404).json({ error: "Not found" });
        res.json(part);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE PRICE / EDIT
router.put("/:id", auth, async (req, res) => {
    try {

        const update = {
            ...req.body,
            ...(req.body.category && { category: formatCategory(req.body.category) })
        };

        const part = await Part.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );

        res.json(part);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE PART
router.delete("/:id", auth, async (req, res) => {
    try {
        await Part.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;