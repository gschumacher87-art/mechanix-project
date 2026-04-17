const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    duration: { type: Number, default: 60 },
    price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Template", TemplateSchema);