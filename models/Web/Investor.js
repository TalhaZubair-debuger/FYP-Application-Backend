const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const investorSchema = Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    investedIn: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ]
})

module.exports = mongoose.model("Investor", investorSchema);