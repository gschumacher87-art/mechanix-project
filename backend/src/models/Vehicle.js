const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
{
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number
    },
    rego: {
        type: String
    },
    vin: {
        type: String
    },
    notes: {
        type: String
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
