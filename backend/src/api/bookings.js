const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Job = require("../models/Job");
const auth = require("../middleware/auth");


// CREATE booking
router.post("/", auth, async (req, res) => {
    try {

        const checklist = (req.body.jobs || []).map(j => ({
            text: j.description || "Task",
            done: false
        }));

        const booking = new Booking({
    title: req.body.title,
    customer: req.body.customer,
    vehicle: req.body.vehicle,
    status: req.body.status || "booked",
    date: new Date(req.body.date + "T00:00:00"),
    checklist: checklist
});

        await booking.save();

        const populated = await Booking.findById(booking._id)
            .populate("customer")
            .populate("vehicle");

        res.status(201).json(populated);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// GET all bookings
router.get("/", auth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("customer")
            .populate("vehicle");

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET single booking
router.get("/:id", auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("customer")
            .populate("vehicle");

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// UPDATE booking
router.put("/:id", auth, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        .populate("customer")
        .populate("vehicle");

        res.json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// DELETE booking
router.delete("/:id", auth, async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// CONVERT BOOKING → JOB
router.post("/:id/convert", auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const job = new Job({
            title: booking.title,
            customer: booking.customer,
            vehicle: booking.vehicle,
            status: "booked",
            checklist: []
        });

        await job.save();

        await Booking.findByIdAndDelete(req.params.id);

        const populatedJob = await Job.findById(job._id)
            .populate("customer")
            .populate("vehicle");

        res.json(populatedJob);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;