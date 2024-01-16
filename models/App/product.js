const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const monthlyRecord = new Schema({
    month: String,
    revenue: Number
})

const productSchema = Schema({
    productId: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true
    },
    stockQuantity: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    revenue: {
        type: Array,
        required: false
    },
    monthlyRecords: [monthlyRecord],
    totalRevenue: {
        type: Number,
        required: false
    },
    predictedRevenue: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Product", productSchema);