const { validationResult } = require("express-validator");
const Product = require("../models/product");
const User = require("../models/user");

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