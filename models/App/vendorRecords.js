const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const records = new Schema({
    quantity: String,
    productName: String,
    description: String,
    youGave: Number,
    youGot: Number,
    sent: Boolean,
    recieved: Boolean,
    date: String,
    month: String,
    transactionId: {
        type: String,
        required: false
    }
})

const vendorRecordsSchema = new Schema({
    totalOrders: {
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
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },

},
    { timestamps: true }
)

module.exports = mongoose.model("VendorRecord", vendorRecordsSchema);