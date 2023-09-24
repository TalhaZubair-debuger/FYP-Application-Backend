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
        required: true
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
}, {
    timestamps: true
})

module.exports = mongoose.model("Product", productSchema);