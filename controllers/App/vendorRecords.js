const { validationResult } = require("express-validator");
const VendorRecords = require("../../models/App/vendorRecords");
const { vendorRevenueCalculator } = require("../../utils/revenueCalculator");
const Product = require("../../models/App/product");
const User = require("../../models/App/user");
const { DateNow } = require("../../utils/date");

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
    const description = req.body.quantity != null ? `${req.body.productName} on Date: ${DateNow()}` : req.body.productName;
    const youGave = req.body.youGave != null ? req.body.youGave : null;
    const youGot = req.body.youGot != null ? req.body.youGot : null;
    const sent = req.body.sent ? req.body.sent : false;
    const recieved = req.body.recieved ? req.body.recieved : false;
    const transactionId = req.body.transactionId ? req.body.transactionId : null;
    const date = new Date();
    const month = date.getMonth();

    try {
        const vendorRecord = await VendorRecords.findOne({ userId: req.userId, vendorId: vendorId });
            if (!vendorRecord) {
                const newVendor = new VendorRecords({
                    records: {
                        quantity,
                        description,
                        youGave,
                        youGot,
                        sent,
                        recieved,
                        date,
                        month,
                        transactionId
                    },
                    vendorId: vendorId,
                    userId: req.userId
                })
                await newVendor.save();
            } else {
                vendorRecord.records.push({
                    quantity,
                    description,
                    youGave,
                    youGot,
                    sent,
                    recieved,
                    date,
                    month,
                    transactionId
                })
                await vendorRecord.save();
            }

            const existingProduct = await Product.findOne({ productName });
            if (existingProduct) {
                existingProduct.stockQuantity = parseInt(existingProduct.stockQuantity) + parseInt(quantity);
                await existingProduct.save();
            }
            else {
                const newProduct = new Product({
                    productId: new Date().toString(),
                    productName,
                    stockQuantity: quantity !== null ? quantity : 0 ,
                    price: 0,
                    user: req.userId
                });
                await newProduct.save();
            }

            const userStockUpdate = await User.findById(req.userId);
            if (quantity) {
                userStockUpdate.currentTotalStock += parseInt(quantity);
            }
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