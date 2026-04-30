const mongoose = require("mongoose");

const PartSchema = new mongoose.Schema({
    category: { type: String, required: true },
    partNumber: { type: String, required: true },
    price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Part", PartSchema);