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
    technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
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
jobSchema.pre("save", function(next) {
    this.totalCost = this.labourCost + this.partsCost;
    next();
});

module.exports = mongoose.model("Job", jobSchema);
