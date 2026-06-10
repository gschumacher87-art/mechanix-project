const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({

    summaryMatch: {
        type: String,
        required: true,
        trim: true
    },

    steps: [{
        text: {
            type: String,
            default: ""
        },

        photoRequired: {
            type: Boolean,
            default: false
        }
    }]

}, {
    timestamps: true
});

module.exports = mongoose.model("Template", templateSchema);