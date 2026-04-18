const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    title: String,

    description: String,
    services: [String],

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },

    status: {
        type: String,
        default: "booked"
    },

    date: {
        type: String,
        required: true
    },

    checklist: [
        {
            text: String,
            done: { type: Boolean, default: false }
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);