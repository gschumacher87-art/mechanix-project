const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// CREATE customer
router.post("/", async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all customers
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single customer
router.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: "Not found" });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE customer
router.put("/:id", async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(customer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE customer
router.delete("/:id", async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: "Customer deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
