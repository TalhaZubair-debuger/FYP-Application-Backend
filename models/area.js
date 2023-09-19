const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const areaSchema = Schema({
    areaName: {
        type: String,
        required: true
    },
    areaCode: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
})

module.exports = mongoose.model("Area", areaSchema);