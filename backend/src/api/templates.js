const express = require("express");
const router = express.Router();

const Template = require("../models/Template");

// ================= GET ALL =================
router.get("/", async (req, res) => {

    const templates = await Template.find()
        .sort({ summaryMatch: 1 });

    res.json(templates);
});

// ================= GET ONE =================
router.get("/:id", async (req, res) => {

    const template = await Template.findById(req.params.id);

    res.json(template);
});

// ================= CREATE =================
router.post("/", async (req, res) => {

    const template = await Template.create({
        summaryMatch: req.body.summaryMatch || "",
        steps: req.body.steps || []
    });

    res.json(template);
});

// ================= UPDATE =================
router.put("/:id", async (req, res) => {

    const template = await Template.findByIdAndUpdate(
        req.params.id,
        {
            summaryMatch: req.body.summaryMatch || "",
            steps: req.body.steps || []
        },
        {
            new: true
        }
    );

    res.json(template);
});

// ================= DELETE =================
router.delete("/:id", async (req, res) => {

    await Template.findByIdAndDelete(req.params.id);

    res.json({
        success: true
    });
});

module.exports = router;