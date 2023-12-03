const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const records = new Schema({
    quantity: String,
    description: String,
    youGave: Number,
    youGot: Number,
    sent: Boolean,
    recieved: Boolean
})

const shopRecordsSchema = new Schema({
    totalRevenue: {
        type: Number,
        required: false
    },
    totalSent: {
        type: Number,
        required: false
    },
    balance: {
        type: Number,
        required: false
    },
    records: [records],
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shopId: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },

},
    { timestamps: true }
)

module.exports = mongoose.model("ShopRecord", shopRecordsSchema);