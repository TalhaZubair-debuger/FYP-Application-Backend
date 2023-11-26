const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    vendorName: {
        type: String,
        required: true
    },
    vendorContact: {
        type: Number,
        required: true
    },
    vendorProducts: {
        type: Array,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    records: {
        type: String,
        required: false
    },
},
)

module.exports = mongoose.model("Vendor", vendorSchema);