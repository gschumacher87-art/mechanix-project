const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
    customerName: String,
    phone: String,
    rego: String,
    make: String,
    model: String,
    buildDate: String,
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        default: null
    },
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    jobs: [{
        summary: String,
        status: {
            type: String,
            default: "waiting"
        },
        timeSpent: {
            type: Number,
            default: 0
        },
        startedAt: {
            type: Number,
            default: null
        }
    }],
    status: {
        type: String,
        enum: [
            "booked",
            "arrived",
            "in-progress",
            "pending-invoice",
            "completed"
        ],
        default: "booked"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Job", jobSchema);