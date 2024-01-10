const express = require("express");
const authController = require("../../controllers/App/auth");
const { body } = require("express-validator")
const isAuth = require("../../middlewares/is-auth");
const router = express.Router();


router.put("/signup",
    [
        body("email")
            .isEmail()
            .withMessage("Enter a valid email")
            .normalizeEmail(),
        body("password")
            .trim()
            .isLength({ min: 5 }),
        body("name")
            .trim()
            .not()
            .isEmpty(),
        body("number")
            .isNumeric()
            .isLength({ min: 10 })
            .withMessage("Please enter Phone No. of valid length")
            .not()
            .isEmpty(),
        body("cnic")
            .isNumeric()
            .trim()
            .not()
            .isEmpty()
    ]
    , authController.signup);

router.post("/login", [
    body("email")
        .isEmail()
        .withMessage("Enter a valid email")
        .normalizeEmail(),
    body("password")
        .trim()
        .isLength({ min: 5 }),
], authController.login);

router.get("/get-user", isAuth, authController.getUserDetails);

router.post("/get-investment", isAuth, authController.postGetInvestment);

module.exports = router;