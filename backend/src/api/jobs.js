const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// CREATE job
router.post("/", async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all jobs
router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find().populate("customer").sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single job
router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("customer");
        if (!job) return res.status(404).json({ error: "Not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE job
router.put("/:id", async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE job
router.delete("/:id", async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
