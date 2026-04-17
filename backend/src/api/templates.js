const express = require("express");
const router = express.Router();

// In-memory for now (swap to DB later)
let templates = [];

// ===== GET ALL =====
router.get("/", (req, res) => {
    res.json(templates);
});

// ===== CREATE =====
router.post("/", (req, res) => {
    const t = {
        id: Date.now().toString(),
        name: req.body.name || "",
        description: req.body.description || "",
        duration: req.body.duration || 60,
        price: req.body.price || 0
    };

    templates.push(t);
    res.json(t);
});

// ===== DELETE =====
router.delete("/:id", (req, res) => {
    templates = templates.filter(t => t.id !== req.params.id);
    res.json({ success: true });
});

module.exports = router;