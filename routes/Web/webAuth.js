const express = require("express");
const { body } = require("express-validator")
const isAuth = require("../../middlewares/is-auth");
const Investor = require("../../models/Web/Investor");
const webAuthController = require("../../controllers/Web/webAuth");
const router = express.Router();


//Investor Routes
router.put("/investor-signup",
    [
        body("email")
            .isEmail()
            .withMessage("Enter a valid email")
            .custom((value, { req }) => {
                return Investor.findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject("Email already exists!")
                        }
                    })
            })
            .normalizeEmail(),
        body("password")
            .trim()
            .isLength({ min: 5 }),
        body("name")
            .trim()
            .not()
            .isEmpty(),
        body("phoneNumber")
            .isNumeric()
            .isLength({ min: 10 })
            .withMessage("Please enter Phone No. of valid length")
            .not()
            .isEmpty()
    ]
    , webAuthController.investorSignup);

router.post("/investor-login", [
    body("email")
        .isEmail()
        .withMessage("Enter a valid email")
        .normalizeEmail(),
    body("password")
        .trim()
        .isLength({ min: 5 }),
], webAuthController.investorLogin);

router.get("/get-investor", isAuth, webAuthController.getInvestorDetails);

router.get("/get-investor-dashboard", isAuth, webAuthController.getInvestorDashboardDetails);

router.post("/generate-payment-request/:userId", isAuth, webAuthController.generatePaymentRequestForDistributor);

router.get("/get-payment-requests", isAuth, webAuthController.getPaymentRequests);

module.exports = router;