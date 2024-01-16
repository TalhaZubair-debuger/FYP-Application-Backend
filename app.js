const express = require("express");
const authRoutes = require("./routes/App/auth");
const shopAndAreasRoutes = require("./routes/App/shopAndAreas");
const productRoutes = require("./routes/App/products");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const vendorRoutes = require("./routes/App/vendors");
const shopRecordsRoutes = require("./routes/App/shopRecords");
const vendorRecordsRoutes = require("./routes/App/vendorRecords");
const investorWebAuthRoutes = require("./routes/Web/webAuth");
const contactUsRoutes = require("./routes/Web/contactUs");
const employeesRoutes = require("./routes/App/employee");
const cors = require("cors");
require('dotenv').config();


const MONGO_URI =
    `mongodb+srv://talhazubairinfo:${process.env.DB_PASSWORD}@fyp-cluter.qauvmhw.mongodb.net/DistributionApp?retryWrites=true&w=majority`;
    // "mongodb://127.0.0.1:27017/DistributionApp";
const app = express();

app.use(bodyParser.json({ limit: '7mb' }));
app.use(cors());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS ,GET, POST, PUT, PATCH, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    next();
})

//App Routes
app.use("/user", authRoutes);
app.use("/shops", shopAndAreasRoutes);
app.use("/shop-records", shopRecordsRoutes);
app.use("/vendor-records", vendorRecordsRoutes);
app.use("/products", productRoutes);
app.use("/vendors", vendorRoutes);
app.use("/employees", employeesRoutes);
//Web Routes
app.use('/website-user', investorWebAuthRoutes);
app.use('/website', contactUsRoutes);

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