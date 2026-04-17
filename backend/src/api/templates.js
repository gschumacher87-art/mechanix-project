const express = require("express");
const router = express.Router();
const Template = require("../models/Template");

// ===== GET ALL =====
router.get("/", async (req, res) => {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
});

// ===== CREATE =====
router.post("/", async (req, res) => {
    const t = new Template({
        name: req.body.name || "",
        description: req.body.description || "",
        duration: req.body.duration || 60,
        price: req.body.price || 0
    });

    await t.save();
    res.json(t);
});

// ===== DELETE =====
router.delete("/:id", async (req, res) => {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

module.exports = router;