const { validationResult } = require("express-validator");
const VendorRecords = require("../models/vendorRecords");
const { vendorRevenueCalculator } = require("../utils/revenueCalculator");
const Product = require("../models/product");
const User = require("../models/user");

exports.addVendorRecords = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const vendorId = req.params.vendorId;
    const quantity = req.body.quantity ? req.body.quantity : null;
    const productName = req.body.productName;
    const youGave = req.body.youGave != null ? req.body.youGave : null;
    const youGot = req.body.youGot != null ? req.body.youGot : null;
    const sent = req.body.sent ? req.body.sent : false;
    const recieved = req.body.recieved ? req.body.recieved : false;

    try {
        const vendorRecord = await VendorRecords.findOne({ userId: req.userId, vendorId: vendorId });
            if (!vendorRecord) {
                const newVendor = new VendorRecords({
                    records: {
                        quantity,
                        productName,
                        youGave,
                        youGot,
                        sent,
                        recieved
                    },
                    vendorId: vendorId,
                    userId: req.userId
                })
                await newVendor.save();
            } else {
                vendorRecord.records.push({
                    quantity,
                    productName,
                    youGave,
                    youGot,
                    sent,
                    recieved
                })
                await vendorRecord.save();
            }

            const existingProduct = await Product.findOne({ productName });
            if (existingProduct) {
                existingProduct.stockQuantity += quantity;
                await existingProduct.save();
            }
            else {
                const newProduct = new Product({
                    productId: new Date().toString(),
                    productName,
                    stockQuantity: quantity,
                    price: 0,
                    user: req.userId
                });
                await newProduct.save();
            }

            const userStockUpdate = await User.findById(req.userId);
            userStockUpdate.currentTotalStock += quantity;
            const checkUserStockUpdate = await userStockUpdate.save();
            if (checkUserStockUpdate){
                const records = await vendorRevenueCalculator(vendorId);
                res.status(200).json({message: "Vendor Record saved!"});
            }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getVendorRecords = async (req, res, next) => {
    const user = req.userId;
    const vendorId = req.params.vendorId;

    try {
        const vendorRecords = await VendorRecords.find({ userId: user, vendorId: vendorId });
        if (vendorRecords.length === 0) {
            res.status(201).json({ message: "No Vendor Records found!" })
        }
        else {
            res.status(201).json({ records: vendorRecords })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}