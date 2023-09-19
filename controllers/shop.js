const { validationResult } = require("express-validator");
const Shop = require("../models/shop");
const Area = require("../models/area");

exports.addShop = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const shopName = req.body.shopName;
    const registration = req.body.registration;
    const ownerPhoneNo = req.body.ownerPhoneNo;
    const ownerCnic = req.body.ownerCnic;
    const area = req.body.area;

    const savedAreas = await Area.findOne({ areaName: area })
    if (!savedAreas) {
        const error = new Error("No or Wrong Area Provided");
        error.statusCode = 422;
        throw error;
    }

    const shop = new Shop({
        shopName: shopName,
        registration: registration,
        ownerPhoneNo: ownerPhoneNo,
        ownerCnic: ownerCnic,
        area: area,
        // user: req.userId
        user: req.body.user
    })

    try {
        await shop.save();
        res.status(200).json({ message: "Shop created successfully!", shop: shop });
    }
    catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getShop = async (req, res, next) => {
    const shopId = req.params.shopId;
    const shop = await Shop.findOne({ _id: shopId });
    if (!shop) {
        const error = new Error("No Shop Found!");
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({ message: "Shop found", shop: shop });
}

exports.updateShop = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const shopName = req.body.shopName;
    const registration = req.body.registration;
    const ownerPhoneNo = req.body.ownerPhoneNo;
    const ownerCnic = req.body.ownerCnic;
    const area = req.body.area;

    const savedAreas = await Area.findOne({ areaName: area })
    if (!savedAreas) {
        const error = new Error("No or Wrong Area Provided");
        error.statusCode = 422;
        throw error;
    }
    try {
        const shop = await Shop.findById({ _id: shopId });
        if (!shop) {
            const error = new Error("No Shop Found");
            error.statusCode = 404;
            throw error;
        }
        if (shop.user.toString()
            !==
            // req.userId
            req.body.user) {
            const error = new Error("Not Authorized!");
            error.statusCode = 403;
            throw error;
        }
        
        shop.shopName = shopName;
        shop.registration = registration;
        shop.ownerPhoneNo = ownerPhoneNo;
        shop.ownerCnic = ownerCnic;

        const updatedShop = await shop.save();
        res.status(200).json({message: "Shop Updated Successfully!", shop: updatedShop});

    } catch (error) {

    }
}