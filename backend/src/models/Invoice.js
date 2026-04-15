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

    // INSERTED BLOCK START
    template: {
        items: [{ name: String, price: Number }],
        labour: [{ name: String, price: Number }],
        notes: String
    },
    // INSERTED BLOCK END

    status: {
    type: String,
    enum: ["draft", "unpaid", "paid"],
    default: "draft"
}
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Invoice", invoiceSchema);