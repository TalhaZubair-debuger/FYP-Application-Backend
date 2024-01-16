const Investor = require("../../models/Web/Investor");;
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken");
const User = require("../../models/App/user");

exports.investorSignup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const name = req.body.name;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new Investor({
            name: name,
            phoneNumber: phoneNumber,
            email: email,
            password: hashedPassword,
        })
        const result = await user.save();
        res.status(201).json({ message: "User Created!", userId: result._id });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.investorLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await Investor.findOne({ email: email });
        if (!user) {
            const error = new Error("A user with this Email could not be found!");
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Wrong Password!");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            "investorssupersecrettoken",
            { expiresIn: "5h" }
        )
        res.status(200).json({ token: token, userId: loadedUser._id.toString() })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getInvestorDetails = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await Investor.findOne({ _id: userId });
        if (!user) {
            res.status(201).json({ message: "No User Data found!" })
        }
        else {
            res.status(201).json({ message: "User found!", user: user })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getInvestorDashboardDetails = async (req, res, next) => {
    const userId = req.userId;

    try {
        const investor = await Investor.findById(userId);
        if (!investor) {
            res.status(200).json({ message: "User not found!" });
            return;
        }

        const productsPromises = investor.investedIn.map(async (item) => {
            const user = await User.find({ _id: item._id });
            return { user, investor };
        });

        const dataPromises = await Promise.all(productsPromises);

        res.status(200).json({ dataPromises });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.generatePaymentRequestForDistributor = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const distributor = await User.findById(userId);
        if (!distributor) {
            res.status(404).json({ message: "Couldn't find distributor!" });
            return;
        }
        distributor.paymentRequests.push({ userId: req.userId });

        await distributor.save();
        res.status(200).json({ message: "Request Sent!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getPaymentRequests = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found!" });
            return;
        }
        const investors = await Investor.find()
        res.status(200).json({ investors });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.postHandleInvestments = async (req, res, next) => {
    const distributorId = req.params.userId;

    try {
        const distributor = await User.findById(distributorId);
        if (!distributor) {
            res.status(404).json({ message: "Error finding the distributor!" });
        }
        const stripe = require('stripe')(distributor.stripePrivateKey);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'pkr',
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

