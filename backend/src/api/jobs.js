const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");
// CREATE JOB
router.post("/", auth, async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET ALL JOBS
router.get("/", auth, async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("customer")
            .populate("vehicle")
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET SINGLE JOB
router.get("/:id", auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("customer")
            .populate("vehicle");
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// UPDATE JOB
router.put("/:id", auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        if (req.body.jobs !== undefined) {
            job.jobs = req.body.jobs;
        }
        if (req.body.status !== undefined) {
            job.status = req.body.status;
        }
        await job.save();
        res.json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// DELETE JOB
router.delete("/:id", auth, async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;