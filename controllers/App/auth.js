const User = require("../../models/App/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken");
const Employee = require("../../models/App/employee");

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
            .json({ token: token, userId: employee.employer.toString(), employer: employee.employer, 
                employeeDesignation: employee.designation })
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
    try {
        const user = await User.findOne({ _id: userId });
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