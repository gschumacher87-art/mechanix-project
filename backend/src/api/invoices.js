const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

// CREATE invoice
router.post("/", auth, async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        await invoice.save();
        res.status(201).json(invoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🔥 CREATE invoice FROM job
router.post("/from-job/:jobId", auth, async (req, res) => {
    try {
        const Job = require("../models/Job");

        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const invoice = new Invoice({
            job: job._id,
            customer: job.customer,
            vehicle: job.vehicle,
            labourCost: job.labourCost,
            partsCost: job.partsCost,
            totalCost: job.totalCost
        });

        await invoice.save();

        // update job status
        job.status = "completed";
        await job.save();

        res.status(201).json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all invoices (WITH OPTIONAL FILTERS)
router.get("/", auth, async (req, res) => {
    try {

        const query = {};

        if (req.query.customer) {
            query.customer = req.query.customer;
        }

        if (req.query.vehicle) {
            query.vehicle = req.query.vehicle;
        }

        const invoices = await Invoice.find(query)
            .populate("job")
            .populate("customer")
            .populate("vehicle")
            .sort({ createdAt: -1 });

        res.json(invoices);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET single invoice
router.get("/:id", auth, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate("job")
            .populate("customer")
            .populate("vehicle");

        if (!invoice) return res.status(404).json({ error: "Not found" });

        res.json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE invoice
router.put("/:id", auth, async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(invoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE invoice
router.delete("/:id", auth, async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: "Invoice deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;