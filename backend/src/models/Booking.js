const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    title: String,

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
    }

}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);