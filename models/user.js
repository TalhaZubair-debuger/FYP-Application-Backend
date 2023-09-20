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
    }
})

module.exports = mongoose.model("User", userSchema);