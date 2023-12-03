const express = require("express");
const authController = require("../../controllers/App/auth");
const { body } = require("express-validator")
const User = require("../../models/App/user");
const isAuth = require("../../middlewares/is-auth");
const router = express.Router();


router.put("/signup",
    [
        body("email")
            .isEmail()
            .withMessage("Enter a valid email")
            .custom((value, { req }) => {
                return User.findOne({ email: value })
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

module.exports = router;