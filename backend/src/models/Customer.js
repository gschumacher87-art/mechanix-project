const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
{
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
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

module.exports = mongoose.model("Customer", customerSchema);
