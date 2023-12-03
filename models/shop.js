const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const shopSchema = new Schema({
    shopName: {
        type: String,
        required: true
    },
    registration: {
        type: String,
        required: true
    },
    ownerPhoneNo: {
        type: String,
        required: true
    },
    ownerCnic: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
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
    revenue: {
        type: Number,
        required: false
    },
},
    { timestamps: true }
)

module.exports = mongoose.model("Shop", shopSchema);