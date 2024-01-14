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
    gotInvestment: {
        type: Boolean,
        required: false
    },
    yourRevenue: {
        type: String,
        required: false
    },
    currentHoldings: {
        type: String,
        required: false
    },
    tagline: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    companyName: {
        type: String,
        required: false
    },
    stripePublishableKey: {
        type: String,
        required: false
    },
    stripePrivateKey: {
        type: String,
        required: false
    },
})

module.exports = mongoose.model("User", userSchema);