const express = require("express");
const { body } = require("express-validator")
const router = express.Router();
const contactUsController = require("../../controllers/Web/contactUs");

router.post("/add-contact-message", [
    body("email")
        .isEmail()
        .trim(),
    body("subject")
        .notEmpty()
        .trim(),
    body("message")
        .notEmpty()
        .trim()
], contactUsController.addNewContactMessage);

module.exports = router;