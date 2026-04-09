const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth working" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint" });
});

module.exports = router;
