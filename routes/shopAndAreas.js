const express = require("express");
const isAuth = require("../middlewares/is-auth");
const { body } = require("express-validator")
const shopController = require("../controllers/shop");
const areaController = require("../controllers/area");

const router = express.Router();

router.put("/add-shop", [
    body("shopName")
        .trim()
        .notEmpty(),
    body("registration")
        .trim()
        .isNumeric()
        .isLength({ min: 5, max: 6 })
        .notEmpty(),
    body("ownerPhoneNo")
        .trim()
        .isNumeric()
        .isLength({ min: 10 }),
    body("ownerCnic")
        .trim()
        .isNumeric()
        .notEmpty(),
    body("area")
        .notEmpty()
        .trim()
], isAuth, shopController.addShop);
router.get("/shop/:shopId", isAuth, shopController.getShop);
router.patch("/edit-shop/:shopId", [
    body("shopName")
        .trim()
        .notEmpty(),
    body("registration")
        .trim()
        .isNumeric()
        .isLength({ min: 5, max: 6 })
        .notEmpty(),
    body("ownerPhoneNo")
        .trim()
        .isNumeric()
        .isLength({ min: 10 }),
    body("ownerCnic")
        .trim()
        .isNumeric()
        .notEmpty(),
    body("area")
        .notEmpty()
        .trim()
], isAuth, shopController.updateShop);
// router.delete("/shop/:shopId");

router.put("/add-area", [
    body("areaName")
        .notEmpty()
        .trim()
    ,
    body("areaCode")
        .notEmpty()
        .trim()
], isAuth, areaController.addArea);

module.exports = router;