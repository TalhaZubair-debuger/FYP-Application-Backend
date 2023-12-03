const express = require("express");
const isAuth = require("../../middlewares/is-auth");
const { body } = require("express-validator")
const vendorController = require("../../controllers/App/vendors");

const router = express.Router();

router.put("/add-vendor",
[
    body("vendorName")
    .trim()
    .notEmpty(),
    body("vendorContact")
    .isNumeric()
    .notEmpty(),
], isAuth, vendorController.addVendor);

router.get("/all-vendors", isAuth, vendorController.getAllVendors);

router.get("/top-vendors", isAuth, vendorController.getTopVendors);

router.get("/vendor/:vendorId", isAuth, vendorController.getVendor);

router.post("/add-product/:vendorId",
[
    body("productName")
    .trim()
    .notEmpty(),
    body("productPrice")
    .isNumeric()
    .notEmpty(),
]
, isAuth, vendorController.addVendorProduct);

router.delete("/delete-product", isAuth, vendorController.deleteVendorProduct);

router.patch("/edit-vendor/:vendorId",[
    body("vendorName")
    .trim()
    .notEmpty(),
    body("vendorContact")
    .isNumeric()
    .notEmpty()
], isAuth, vendorController.updateVendorDetails );

module.exports = router;