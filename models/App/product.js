const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    
    totalRevenue: {
        type: String,
        required: false
    },
    purchasePrice: {
        type: String,
        required: false
    },
    sellingPrice: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Product", productSchema);