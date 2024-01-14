const User = require("../../models/App/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken");
const Employee = require("../../models/App/employee");
const ShopRecords = require("../../models/App/shopRecords");
const Product = require("../../models/App/product");
const Investor = require("../../models/Web/Investor");

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const number = req.body.number;
    const cnic = req.body.cnic;

    try {
        const checkUserExist = await User.findOne({ email });
        if (checkUserExist != null) {
            res.status(422).json({ message: "Email Already Exists!" })
            return;
        }

        const checkEmployeeExist = await Employee.findOne({ email });
        if (checkEmployeeExist != null) {
            res.status(422).json({ message: "Email Already Exists!" })
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
            number: number,
            cnic: cnic
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

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {

            const employee = await Employee.findOne({ email });
            if (!employee) {
                const error = new Error("A user with this Email could not be found!");
                error.statusCode = 401;
                throw error;
            }
            const isEqual = await bcrypt.compare(password, employee.password);
            if (!isEqual) {
                const error = new Error("Wrong Password!");
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: employee.email,
                    userId: employee.employer.toString()
                },
                "realsupersecretshit",
                { expiresIn: "5h" }
            )
            res.status(200)
                .json({
                    token: token, userId: employee.employer.toString(), employer: employee.employer,
                    employeeDesignation: employee.designation
                })
            return;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Wrong Password!");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            "realsupersecretshit",
            { expiresIn: "5h" }
        )
        res.status(200).json({ token: token, userId: user._id.toString() })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getUserDetails = async (req, res, next) => {
    const userId = req.userId;
    const dueDate = new Date() + 1;
    let revenue = 0;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(201).json({ message: "No User Data found!" })
        }
        else {
            const newDate = new Date();
            if (user.dueCalculation < newDate || user.dueCalculation == null) {
                const shopRecords = await ShopRecords.find({ userId });
                if (!shopRecords) {
                    res.status(201).json({ message: "User found!", user: user })
                    return;
                }
                shopRecords.map(item => {
                    revenue += item.totalRevenue;
                })
                user.totalRevenue = revenue;
                user.dueCalculation = dueDate;

                await user.save();
            }
            res.status(201).json({ message: "User found!", user: user })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.postGetInvestment = async (req, res, next) => {
    const investorEmail = req.body.investorEmail;
    const amount = req.body.amount;
    const equity = req.body.equity;
    const tagline = req.body.tagline;
    const image = req.body.image;
    const companyName = req.body.companyName;
    const stripePublishableKey = req.body.stripePublishableKey;
    const stripePrivateKey = req.body.stripePrivateKey;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.investorEmail = investorEmail;
        user.amount = amount;
        user.equity = equity;
        user.tagline = tagline;
        user.image = image;
        user.companyName = companyName;
        user.stripePublishableKey = stripePublishableKey;
        user.stripePrivateKey = stripePrivateKey;

        await user.save();

        res.status(200).json({ message: "Investment information saved!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getDistributorsNeedInvestment = async (req, res, next) => {
    try {
        const users = await User.find({ gotInvestment: true });
        if (!users) {
            res.status(404).json({ message: "No Distributors found!" });
        }
        const productsPromises = users.map(async (item) => {
            const products = await Product.find({ user: item._id });
            return { user: item, products };
        });

        const distributorsWithProducts = await Promise.all(productsPromises);

        res.status(200).json({ distributorsWithProducts });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.postHandleInvestorPayment = async (req, res, next) => {
    const userId = req.params.userId;
    const investorId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Couldn't proceed payment!" });
            return;
        }
        user.gotInvestment = true;
        await user.save();
        const investor = await Investor.findById(investorId);
        if (!investor) {
            res.status(409).json({ message: "Investor is not authorized!" });
            return;
        }
        investor.investedIn.push(user._id);
        await investor.save()
        res.status(200).json({ message: "Payment Succeeded!" })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}