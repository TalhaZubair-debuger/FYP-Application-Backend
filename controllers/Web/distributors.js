const User = require("../../models/App/user");

exports.getAllDistributors = async (req, res, next) => {
    try {
        const users = await User.find({ investment: true });
        if (users.length === 0) {
            res.status(201).json({ message: "No Distributors found!" })
        }
        else {
            res.status(201).json({ message: "Distributors found!", users })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}