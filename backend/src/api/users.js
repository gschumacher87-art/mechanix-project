const express = require("express");
const router = express.Router();
const User = require("../models/User");

// CREATE user (technician)
router.post("/", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all users
router.get("/", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

module.exports = router;