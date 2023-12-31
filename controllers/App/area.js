const { validationResult } = require("express-validator");
const Area = require("../../models/App/area");
const Shop = require("../../models/App/shop");
const User = require("../../models/App/user");

exports.addArea = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }

    const areaName = req.body.areaName;
    const areaCode = req.body.areaCode;

    try {
        const checkAreaAlreadyExists = await Area.findOne({ areaName: areaName, user: req.userId });
        if (checkAreaAlreadyExists) {
            const error = new Error("Area Already exits!");
            error.statusCode = 409;
            throw error;
        }
        const area = new Area({
            areaName: areaName,
            areaCode: areaCode,
            user: req.userId
        })
        const response = await area.save();
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("User not found!");
            error.statusCode = 404;
            throw error;
        }
        user.areas.push(response._id);
        await user.save();
        res.status(201).json({ message: "Area Created Successfully!", userId: req.userId })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteArea = async (req, res, next) => {
    const areaId = req.params.areaId;
    const area = await Area.findOne({ areaId: areaId, user: req.body.user });//testing
    if (area.length === 0) {
        const error = new Error("Area Could not be found!");
        error.statusCode = 404;
        throw error;
    }
    try {
        const shops = await Shop.find({ area: areaName, user: req.body.user })//testing
        for (let i = 0; i < shops.length; i++) {
            await Shop.findOneAndRemove({ area: areaName, user: req.body.user });
        }
        await Area.findOneAndRemove({ areaName: areaName, user: req.body.user });//testing
        res.status(200).json({message: "Area and the Shops under it are Deleted!"});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
    // const user = await User.findOne({})
}