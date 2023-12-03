const express = require("express");
const isAuth = require("../../middlewares/is-auth");
const productController = require("../../controllers/App/products");
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
        .withMessage("Product Name cannot be empty, and minimum length is 4 characters"),
    body("price")
        .notEmpty()
        .isFloat()
        .trim()
        .withMessage("The price should be in decimal values. Example: 10.00")
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

router.get("/top-products", isAuth, productController.getTopProducts);

router.get("/low-stock-products", isAuth, productController.getLowStockProducts);

router.post("/update-stocks", [
    body("productName")
        .trim()
        .notEmpty()
        .withMessage("The product name should be non-Empty"),
    body("stockQuantity")
        .notEmpty()
        .trim()
        .withMessage("Stock Quantity must be given while updating Stocks"),
], isAuth, productController.updateStocks);

router.delete("/delete-product/:productId", isAuth, productController.deleteProduct);

module.exports = router;