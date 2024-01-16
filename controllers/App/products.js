const { validationResult } = require("express-validator");
const Product = require("../../models/App/product");
const User = require("../../models/App/user");
const { calculateProductRevenueOnUserLogin } = require("../../utils/revenueCalculator");
const ss = require('simple-statistics');


exports.addProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }

    const productId = req.body.productId;
    const productName = req.body.productName;
    const price = req.body.price;
    const user = req.userId;

    try {
        const checkProductAlreadyExists = await Product.findOne({ productName: productName, user: user });
        if (checkProductAlreadyExists) {
            const error = new Error("The product already exists");
            error.statusCode = 409;
            throw error;
        }
        const product = new Product({
            productId: productId,
            productName: productName,
            price: price,
            user: user
        })
        await product.save();
        res.status(201).json({ message: "Product added successfully!", product: product });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }

    const productId = req.params.productId;
    const productName = req.body.productName;
    const stockQuantity = req.body.stockQuantity;
    const price = req.body.price;
    const user = req.userId;
    try {
        const product = await Product.findOne({ _id: productId, user: user });
        if (!product) {
            const error = new Error("No Product found!");
            error.statusCode = 404;
            throw error;
        }
        product.productName = productName;
        product.productId = productId;
        if (price !== null) {
            product.price = price;
        }
        if (stockQuantity !== null) {
            product.stockQuantity = stockQuantity;
            const user = await User.findById(req.userId);
            user.currentTotalStock += parseInt(stockQuantity);
            await user.save();
        }
        await product.save();
        res.status(200).json({ message: "Product updated successfully!", product: product });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;
    const user = req.userId;
    try {
        const product = await Product.findOne({ _id: productId, user: user });
        if (!product) {
            const error = new Error("Product not found!");
            error.statusCode = 404;
            throw error;
        }
        res.status(201).json({ message: "Product Found!", product: product })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getAllProducts = async (req, res, next) => {
    const user = req.userId;

    try {
        const products = await Product.find({ user: user });
        if (products.length === 0) {
            res.status(201).json({ message: "No Products found!" })
        }
        else {
            res.status(201).json({ message: "Products found!", products: products })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getTopProducts = async (req, res, next) => {
    const user = req.userId;
    try {
        const products = await Product.find({ user: user }).limit(3);
        if (products.length === 0) {
            res.status(201).json({ message: "No Products found!" })
        }
        else {
            res.status(201).json({ message: "Products found!", products: products })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getLowStockProducts = async (req, res, next) => {
    const user = req.userId;
    try {
        const products = await Product.find({ user: user, $expr: { $lt: [{ $toInt: "$stockQuantity" }, 100] } });
        if (products.length === 0) {
            res.status(201).json({ message: "No Products found!" })
        }
        else {
            res.status(201).json({ message: "Low Stock Products found!", products: products })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateStocks = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }

    const productName = req.body.productName;
    const stockQuantity = req.body.stockQuantity;
    try {
        const product = await Product.findOne({ productName: productName, user: req.userId });
        if (!product) {
            const error = new Error("No product found!");
            error.statusCode = 404;
            throw error;
        }
        product.stockQuantity = stockQuantity;
        await product.save();
        const user = await User.findById(req.userId);
        user.currentTotalStock += parseInt(stockQuantity);
        user.save();
        res.status(200).json({ message: "Stock Updated!", stockQuantity: product.stockQuantity });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteProduct = async (req, res, next) => {
    const productId = req.params.productId;
    try {
        const response = await Product.findOneAndDelete({ _id: productId, user: req.userId });
        if (!response) {
            const error = new Error("No Product Found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: "Product Deleted!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getCalculateRevenue = async (req, res, next) => {
    const user = req.userId;

    try {
        const response = await calculateProductRevenueOnUserLogin(user);
        if (response !== null) {
            res.status(201).json({ message: "Done" });
        }
        else {
            res.status(500).json({ message: "Product revenue calculation problem" });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getProductMonthlyRevenue = async (req, res, next) => {
    const productId = req.params.productId;

    try {
        const productRecords = await Product.findById(productId);
        if (!productRecords) {
            res.status(404).json("Error finding product records");
            return;
        }

        const Jan = productRecords.revenue.filter(item => item.month == "0");
        const Dec = productRecords.revenue.filter(item => item.month == "11");
        const Nov = productRecords.revenue.filter(item => item.month == "10");

        const NovRevenue = Nov.reduce((sum, entry) => {
            if (typeof entry.youGot === 'number') {
                return sum + parseInt(entry.youGot);
            }
            return sum;
        }, 0);
        const DecRevenue = Dec.reduce((sum, entry) => {
            if (typeof entry.youGot === 'number') {
                return sum + parseInt(entry.youGot);
            }
            return sum;
        }, 0);
        const JanRevenue = Jan.reduce((sum, entry) => {
            if (typeof entry.youGot === 'number') {
                return sum + parseInt(entry.youGot);
            }
            return sum;
        }, 0);

        if (productRecords.monthlyRecords[0].month == "10") {
            productRecords.monthlyRecords[0].revenue = NovRevenue;
        }
        else {
            productRecords.monthlyRecords.push({
                revenue: NovRevenue,
                month: "10"
            })
        }

        if (productRecords.monthlyRecords[1].month == "11") {
            productRecords.monthlyRecords[1].revenue = DecRevenue;
        }
        else {
            productRecords.monthlyRecords.push({
                revenue: DecRevenue,
                month: "11"
            })
        }

        if (productRecords.monthlyRecords[2].month == "0") {
            productRecords.monthlyRecords[2].revenue = JanRevenue;
        }
        else {
            productRecords.monthlyRecords.push({
                revenue: JanRevenue,
                month: "0"
            })
        }

        await productRecords.save();

        const product = await Product.findById(productId);
        const xData = [10, 11, 0];
        const yData = [product.monthlyRecords[0].revenue, product.monthlyRecords[1].revenue,
        product.monthlyRecords[2].revenue];

        const { slope, intercept } = linearRegression(xData, yData);
        const newX = 1;
        const predictedY = slope * newX + intercept;
        console.log(`Predicted Y for ${ newX }: ${ predictedY }`);
        product.predictedRevenue = predictedY;
        await product.save();

        res.status(200).json({ message: "Done calculating monthly records", productMonthlyData: productRecords });
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

// Example usage:

