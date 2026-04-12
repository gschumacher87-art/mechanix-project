const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    vehicle: {
        type: String,
        default: ""
    },

    date: {
        type: String,
        required: true
    },

    time: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["pending", "arrived", "cancelled"],
        default: "pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);