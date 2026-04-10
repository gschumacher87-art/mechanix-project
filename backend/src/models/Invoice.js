const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
{
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
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
    },
    status: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Invoice", invoiceSchema);
