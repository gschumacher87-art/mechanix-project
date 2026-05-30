const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    title: String,

    description: String,
    services: [String],

    customerName: String,
    phone: String,
    rego: String,
    vehicleName: String,

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null
    },

    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        default: null
    },

    status: {
        type: String,
        default: "booked"
    },

    date: {
        type: String,
        required: true
    },

    duration: {
        type: Number,
        default: 1
    },

    checklist: [
        {
            text: String,
            done: {
                type: Boolean,
                default: false
            }
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);