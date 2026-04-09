const express = require("express");
const router = express.Router();

const User = require("../models/User");

let users = [];

router.post("/register", (req, res) => {
  const { email, password } = req.body;

  const newUser = new User(email, password);
  users.push(newUser);

  res.json({ message: "User registered" });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful" });
});

module.exports = router;
