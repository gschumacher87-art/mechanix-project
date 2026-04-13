const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");

// CREATE vehicle
router.get("/", async (req, res) => {
    try {
        const { customer } = req.query;

        let query = {};

        if (customer) {
            query.customer = customer;
        }

        const vehicles = await Vehicle
            .find(query)
            .populate("customer")
            .sort({ createdAt: -1 });

        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single vehicle
router.get("/:id", async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate("customer");
        if (!vehicle) return res.status(404).json({ error: "Not found" });
        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE vehicle
router.put("/:id", async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(vehicle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE vehicle
router.delete("/:id", async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: "Vehicle deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
