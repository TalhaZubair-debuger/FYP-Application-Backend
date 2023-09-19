const { validationResult } = require("express-validator");
const Area = require("../models/area");

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
        const checkAreaAlreadyExists = await Area.findOne({areaName: areaName, user: req.userId});
        if (checkAreaAlreadyExists){
            const error = new Error("Area Already exits!");
            error.statusCode = 409;
            throw error;
        }
        const area = new Area({
            areaName: areaName,
            areaCode: areaCode,
            // user: req.userId
            user: req.body.userId
        })
        await area.save();
        res.status(201).json({message: "Area Created Successfully!", userId: req.userId})
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}