const express = require("express");
const authRoutes = require("./routes/auth");
const shopAndAreasRoutes = require("./routes/shopAndAreas");
const productRoutes = require("./routes/products");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();


const MONGO_URI =
    `mongodb+srv://talhazubairinfo:${process.env.DB_PASSWORD}@fyp-cluter.qauvmhw.mongodb.net/DistributionApp?retryWrites=true&w=majority`;
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS ,GET, POST, PUT, PATCH, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    next();
})

app.use("/user", authRoutes);
app.use("/shops", shopAndAreasRoutes);
app.use("/products", productRoutes);


mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected!");
        app.listen(8080);
    })
    .catch(err => console.log(err))

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data })
})