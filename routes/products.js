const express = require("express");
const isAuth = require("../middlewares/is-auth");
const productController = require("../controllers/products");
const { body } = require("express-validator");


const router = express.Router();

router.put("/add-product", [
    body("productId")
        .notEmpty()
        .trim()
        .withMessage("Product Id cannot be empty"),
    body("productName")
        .notEmpty()
        .trim()
        .isLength({ min: 4 })
        .withMessage("Product Name cannot be empty, and minimum length is 4 characters"),
    body("price")
        .notEmpty()
        .isFloat()
        .trim()
        .withMessage("The price should be in decimal values. Example: 10.00"),
    body("stockQuantity")
        .isNumeric()
        .notEmpty()
        .trim()
        .withMessage("Stock Quantity must be provided")
], isAuth, productController.addProduct);

router.patch("/edit-product/:productId", [
    body("productName")
        .notEmpty()
        .trim()
        .withMessage("Product Name cannot be empty"),
    body("price")
        .isFloat()
        .trim()
        .withMessage("The price should be in decimal values. Example: 10.00"),
    body("stockQuantity")
        .isNumeric()
        .trim()
], isAuth, productController.updateProduct);

router.get("/product/:productId", isAuth, productController.getProduct);

router.get("/products", isAuth, productController.getAllProducts);

router.patch("/update-stocks/:productId", [
    body("stockQuantity")
        .notEmpty()
        .isNumeric()
        .trim()
        .withMessage("Stock Quantity must be given while updating Stocks"),
    body("price")
        .isFloat()
        .trim()
        .notEmpty()
        .withMessage("The price should be non-Empty and in decimal values. Example: 10.00")
], isAuth, productController.updateStocks);

module.exports = router;