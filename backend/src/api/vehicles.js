const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const auth = require("../middleware/auth");

// CREATE vehicle
router.post("/", auth, async (req, res) => {
    try {
        const vehicle = new Vehicle({
            customer: req.body.customer,
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            rego: req.body.rego,
            vin: req.body.vin,
            notes: req.body.notes
        });

        await vehicle.save();

        res.status(201).json(vehicle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET vehicles
router.get("/", auth, async (req, res) => {
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
router.get("/:id", auth, async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate("customer");
        if (!vehicle) return res.status(404).json({ error: "Not found" });
        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE vehicle
router.put("/:id", auth, async (req, res) => {
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
router.delete("/:id", auth, async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: "Vehicle deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;