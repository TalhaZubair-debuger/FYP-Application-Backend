const { validationResult } = require("express-validator");
const ShopRecords = require("../../models/App/shopRecords");
const { DateNow } = require("../../utils/date");
const Product = require("../../models/App/product");
const { revenueCalculator } = require("../../utils/revenueCalculator");
const User = require("../../models/App/user");

exports.addShopRecords = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const shopId = req.params.shopId;
    const quantity = req.body.quantity ? req.body.quantity : null;
    const productName = req.body.productName;
    console.log(productName + " " + shopId);
    //product name in description
    const description = req.body.quantity != null ? `${req.body.description} Date: ${DateNow()}` : req.body.description;
    const youGave = req.body.youGave != null ? req.body.youGave : null;
    const youGot = req.body.youGot != null ? req.body.youGot : null;
    const sent = req.body.sent ? req.body.sent : false;
    const recieved = req.body.recieved ? req.body.recieved : false;

    try {
        const shopRecord = await ShopRecords.findOne({ userId: req.userId, shopId: shopId });
        if (quantity !== null) {
            const productExist = await Product.findOne({
                user: req.userId,
                $expr: { $gt: [{ $toInt: "$stockQuantity" }, quantity - 1] },
                productName
            })
            if (productExist) {
                if (!shopRecord) {
                    //Shop Record here
                    const newShopRecord = new ShopRecords({
                        records: {
                            quantity,
                            description,
                            youGave,
                            youGot,
                            sent,
                            recieved
                        },
                        shopId,
                        userId: req.userId
                    })
                    await newShopRecord.save();
                } else {
                    shopRecord.records.push({
                        quantity,
                        description,
                        youGave,
                        youGot,
                        sent,
                        recieved
                    })
                    await shopRecord.save();
                }

                const records = await revenueCalculator(shopId);

                productExist.stockQuantity = productExist.stockQuantity - quantity;
                await productExist.save();

                const userStockUpdate = await User.findById(req.userId);
                userStockUpdate.currentTotalStock -= quantity;
                const checkUserStockUpdate = await userStockUpdate.save();
                if (checkUserStockUpdate) {
                    res.status(200).json({ message: "Record Saved!", records: records });
                } else {
                    res.status(200).json({ message: "Error in updating stocks for the user" });
                }

            }
            else {
                res.status(404).json({ message: "Selected Product doesnt have required quantity of stock." });
            }
        }
        else {
            const product = await Product.findOne({ productName, user: req.userId });
            if (product) {
                if (!shopRecord) {
                    res.status(404).json({
                        message: `No Shop record found. You need to first send product inorder to recieve payment`
                    });
                }
                else {
                    if (description != null && youGot != null) {
                        shopRecord.records.push({
                            quantity,
                            description,//Ok
                            youGave,
                            youGot,//Ok
                            sent,
                            recieved//Ok
                        })
                        const result = await shopRecord.save();
                        
                        if (result) {
                            const records = await revenueCalculator(shopId);
                            res.status(200).json({ message: "Record Saved!", records: records });
                        }
                    }
                    else {
                        res.status(422).json({
                            message: `Product name and amount cannot be empty while recieving amount`
                        });
                    }
                }
            }
            else {
                res.status(404).json({
                    message: `Couldn't find the requested product. Try again later!`
                });
            }
        }

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getRecords = async (req, res, next) => {
    const user = req.userId;
    const shopId = req.params.shopId;

    try {
        const shopRecords = await ShopRecords.find({ userId: user, shopId: shopId });
        if (shopRecords.length === 0) {
            res.status(201).json({ message: "No Shop Records found!" })
        }
        else {
            res.status(201).json({ records: shopRecords })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}