const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contactUsSchema = Schema({
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model("Contact", contactUsSchema);