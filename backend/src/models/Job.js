const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
{
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

    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },

    // 🔥 WORKFLOW STATUS
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
    },

    // ⏱️ CLOCKING
    clockIn: {
        type: Date
    },
    clockOut: {
        type: Date
    },

    // 📸 PHOTO CATEGORIES
    photos: {
        brakes: [String],
        suspension: [String],
        engine: [String],
        other: [String]
    },

    // 💰 COSTS
    labourCost: {
        type: Number,
        default: 0
    },
    partsCost: {
        type: Number,
        default: 0
    },
    totalCost: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Job", jobSchema);
