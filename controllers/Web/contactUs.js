const { validationResult } = require("express-validator");
const ContactUs = require("../../models/Web/contactUs");

exports.addNewContactMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    try {
        const contactUs = new ContactUs({
            email,
            subject,
            message
        });
        await contactUs.save()
        res.status(201).json({ message: "Message Sent Successfully!" })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}