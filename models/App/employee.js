const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    area: {
        type: String,
        required: false,
    },
    employer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    revenue: {
        type: Array,
        required: false
    }
})

module.exports = mongoose.model("Employee", employeeSchema);