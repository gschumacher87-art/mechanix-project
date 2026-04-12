const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Job = require("../models/Job");


// CREATE booking
router.post("/", async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// GET all bookings
router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find().populate("customerId");
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// UPDATE booking
router.put("/:id", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// DELETE booking
router.delete("/:id", async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🔥 CONVERT BOOKING → JOB
router.post("/:id/convert", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // create job from booking
        const job = new Job({
            customerId: booking.customerId,
            bookingId: booking._id,
            status: "in-progress"
        });

        await job.save();

        // update booking status
        booking.status = "arrived";
        await booking.save();

        res.json({ booking, job });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;