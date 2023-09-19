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
    areas: [
        {
            type: Schema.Types.ObjectId,
            ref: "Area"
        }
    ],
    shops: [
        {
            type: Schema.Types.ObjectId,
            ref: "Shop"
        }
    ],
    role: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model("User", userSchema);