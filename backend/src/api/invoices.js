const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

// CREATE invoice
router.post("/", async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        await invoice.save();
        res.status(201).json(invoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all invoices
router.get("/", async (req, res) => {
    try {
        const invoices = await Invoice.find()
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
router.get("/:id", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: "Invoice deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
