require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./api/auth");
const customerRoutes = require("./api/customers");
const auth = require("./middleware/auth");
const admin = require("./middleware/admin");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);

app.get("/", (req, res) => {
  res.send("Mechanix API running");
});

app.get("/api/protected", auth, (req, res) => {
  res.json({ message: "Protected route working", user: req.user });
});

app.get("/api/admin", auth, admin, (req, res) => {
  res.json({ message: "Admin route working" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
