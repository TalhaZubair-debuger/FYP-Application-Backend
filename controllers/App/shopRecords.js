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
    const transactionId = req.body.transactionId ? req.body.transactionId : null;
    const date = new Date();
    const month = date.getMonth();

    try {
        const shopRecord = await ShopRecords.findOne({ userId: req.userId, shopId: shopId });
        if (quantity !== null) {
            const productExist = await Product.findOne({
                user: req.userId,
                $expr: { $gt: [{ $toInt: "$stockQuantity" }, quantity - 1] },
                productName
            })
            if (productExist.price === "0") {
                res.status(201).json({ message: "Product Price is not provided after purchase from vendor" });
                return;
            }
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
                            recieved,
                            date,
                            month,
                            transactionId
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
                        recieved,
                        date,
                        month,
                        transactionId
                    })
                    await shopRecord.save();
                }

                const records = await revenueCalculator(shopId);

                productExist.stockQuantity = productExist.stockQuantity - quantity;
                productExist.revenue.push({
                    youGave,
                    youGot: youGot === null ? youGot : parseInt(youGot),
                    date,
                    month
                })
                if (youGot !== null) {
                    productExist.totalRevenue = parseInt(productExist.totalRevenue) + parseInt(youGot);
                }
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

            const productExist = await Product.findOne({
                user: req.userId,
                productName
            })

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
                            recieved,//Ok
                            date,
                            month,
                            transactionId
                        })

                        productExist.revenue.push({
                            youGave,
                            youGot: youGot === null ? youGot : parseInt(youGot),
                            date,
                            month
                        })
                        await productExist.save();

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

exports.getShopMonthlyRevenue = async (req, res, next) => {
    const shopId = req.params.shopId;

    try {
        const shopRecords = await ShopRecords.findOne({ shopId });
        if (!shopRecords) {
            res.status(404).json("Error finding shop records");
            return;
        }

        const Jan = shopRecords.records.filter(item => item.month === "0");
        const Dec = shopRecords.records.filter(item => item.month === "11");
        const Nov = shopRecords.records.filter(item => item.month === "10");

        const NovRevenue = Nov.reduce((sum, entry) => {
            if (typeof entry.youGot === 'number') {
                return sum + entry.youGot;
            }
            return sum;
        }, 0);
        const DecRevenue = Dec.reduce((sum, entry) => {
            if (typeof entry.youGot === 'number') {
                return sum + entry.youGot;
            }
            return sum;
        }, 0);
        const JanRevenue = Jan.reduce((sum, entry) => {
            if (typeof entry.youGot === 'number') {
                return sum + entry.youGot;
            }
            return sum;
        }, 0);


        if (!shopRecords.monthlyRecords[0]){
            shopRecords.monthlyRecords.push({
                revenue: NovRevenue,
                month: "November"
            })
        }
        else if ( shopRecords.monthlyRecords[0].month === "November") {
            shopRecords.monthlyRecords[0].revenue = NovRevenue;
        } 

        if (!shopRecords.monthlyRecords[1]){
            shopRecords.monthlyRecords.push({
                revenue: DecRevenue,
                month: "December"
            })
        }
        else if ( shopRecords.monthlyRecords[1].month === "December") {
            shopRecords.monthlyRecords[1].revenue = DecRevenue;
        } 

        if (!shopRecords.monthlyRecords[2]){
            shopRecords.monthlyRecords.push({
                revenue: JanRevenue,
                month: "January"
            })
        }
        else if ( shopRecords.monthlyRecords[2].month === "January") {
            shopRecords.monthlyRecords[2].revenue = JanRevenue;
        }

        await shopRecords.save();

        const shopRecord = await ShopRecords.findOne({ shopId });
        const xData = [10, 11, 0];
        const yData = [shopRecord.monthlyRecords[0].revenue, shopRecord.monthlyRecords[1].revenue,
        shopRecord.monthlyRecords[2].revenue];

        const { slope, intercept } = linearRegression(xData, yData);
        const newX = 1;
        const predictedY = slope * newX + intercept;
        console.log(`Predicted Y for ${ newX }: ${ predictedY }`);
        shopRecord.predictedRevenue = predictedY;
        await shopRecord.save();
        res.status(200).json({message: "Done", shopRecord});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}


function mean(arr) {
    return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function calculateNumeratorAndDenominator(x, y, xMean) {
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < x.length; i++) {
        numerator += (x[i] - xMean) * (y[i] - mean(y));
        denominator += Math.pow(x[i] - xMean, 2);
    }

    return { numerator, denominator };
}

function calculateSlope(numerator, denominator) {
    return numerator / denominator;
}

function calculateIntercept(xMean, yMean, slope) {
    return yMean - slope * xMean;
}

function linearRegression(x, y) {
    if (x.length !== y.length) {
        throw new Error("Input arrays must have the same length");
    }

    const xMean = mean(x);
    const yMean = mean(y);

    const { numerator, denominator } = calculateNumeratorAndDenominator(x, y, xMean);

    const slope = calculateSlope(numerator, denominator);
    const intercept = calculateIntercept(xMean, yMean, slope);

    return { slope, intercept };
}
