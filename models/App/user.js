const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    cnic: {
        type: String,
        required: true
    },
    shops: [
        {
            type: Schema.Types.ObjectId,
            ref: "Shop"
        }
    ],
    areas: [
        {
            type: Schema.Types.ObjectId,
            ref: "Area"
        }
    ],
    role: {
        type: String,
        required: false
    },
    currentTotalStock: {
        type: Number,
        required: false,
        default: 0
    },
    investment: {
        type: Boolean,
        required: false
    },
    employees: {
        type: Array,
        required: false
    },
    investorEmail: {
        type: String,
        required: false
    },
    amount: {
        type: String,
        required: false
    },
    equity: {
        type: String,
        required: false
    },
    totalRevenue: {
        type: String,
        required: false
    },
    dueCalculation: {
        type: String,
        required: false
    },
})

module.exports = mongoose.model("User", userSchema);