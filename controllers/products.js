const { validationResult } = require("express-validator");
const Product = require("../models/product");

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
    const stockQuantity = req.body.stockQuantity;
    const user = req.body.user;//testing

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
            stockQuantity: stockQuantity,
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
    const user = req.body.user;//testing

    if (!productName) {
        const error = new Error("Cannot update product without product name provided");
        error.status = 422;
        throw error;
    }
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
    const user = req.body.user;//testing

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
    const user = req.body.user;//testing

    try {
        const products = await Product.find({ user: user });
        if (!user) {
            const error = new Error("No products found!");
            error.statusCode = 404;
            throw error;
        }
        res.status(201).json({ message: "Products found!", products: products })
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

    const productId = req.params.productId;
    const stockQuantity = req.body.stockQuantity;
    const price = req.body.price;
    const user = req.body.user;//testing

    try {
        const product = await Product.findOne({ _id: productId, user: user });
        if (!product) {
            const error = new Error("No product found!");
            error.statusCode = 404;
            throw error;
        }
        product.stockQuantity = stockQuantity;
        if (price !== null) {
            product.price = price;
        }
        await product.save();
        res.status(200).json({ message: "Stock Updated!", stockQuantity: product.stockQuantity });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}