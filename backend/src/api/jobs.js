const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const auth = require("../middleware/auth");

// CREATE job
router.post("/", auth, async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all jobs
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

// GET single job
router.get("/:id", auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("customer")
            .populate("vehicle");

        if (!job) return res.status(404).json({ error: "Not found" });

        res.json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE job
router.put("/:id", auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ error: "Not found" });

        // update sub-jobs
        if (req.body.jobs) {
            job.jobs = req.body.jobs;
        }

        // 🔥 derive status from sub-jobs
        const hasInProgress = job.jobs.some(j => j.status === "in-progress");
        const hasPaused = job.jobs.some(j => j.status === "paused");
        const allDone = job.jobs.length && job.jobs.every(j => j.status === "done");

        if (allDone) job.status = "pending-invoice";
        else if (hasInProgress || hasPaused) job.status = "in-progress";
        else job.status = "arrived";

        await job.save();

        res.json(job);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE job
router.delete("/:id", auth, async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;