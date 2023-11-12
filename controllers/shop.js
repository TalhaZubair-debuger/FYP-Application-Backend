const { validationResult } = require("express-validator");
const Shop = require("../models/shop");
const Area = require("../models/area");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

exports.addShop = async (req, res, next) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     const error = new Error("Validation Failed, data entered in wrong format.");
    //     error.statusCode = 422;
    //     throw error;
    // }
    const shopName = req.body.shopName;
    const registration = req.body.registration;
    const ownerPhoneNo = req.body.ownerPhoneNo;
    const ownerCnic = req.body.ownerCnic;
    const area = req.body.area;

    console.log(req.userId);
    const user = await User.findById(
        // req.body.user//testing Only
        req.userId
    );
    if (!user) {
        const error = new Error("User not authorized");
        error.statusCode = 422;
        throw error;
    }
    console.log(area + " and " + shopName);
    const userObj = new mongoose.Types.ObjectId(user);
    const savedAreas = await Area.findOne({ areaName: area, user: userObj });//testing
    if (!savedAreas) {
        const error = new Error("No or Wrong Area Provided");
        error.statusCode = 404;
        throw error;
    }

    const shop = new Shop({
        shopName: shopName,
        registration: registration,
        ownerPhoneNo: ownerPhoneNo,
        ownerCnic: ownerCnic,
        area: area,
        user: req.userId
        // user: req.body.user//testing Only
    })

    try {
        const result = await shop.save();

        user.shops.push(result._id);
        await user.save();
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
    const shop = await Shop.findOne({ _id: shopId, user: req.userId });
    if (!shop) {
        const error = new Error("No Shop Found!");
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({ message: "Shop found", shop: shop });
}

exports.getAllShops = async (req, res, next) => {
    const shop = await Shop.find({ user: req.userId });
    if (shop.length === 0) {
        const error = new Error("No Shops Found!");
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({ message: "Shops found", shops: shop });
}

exports.updateShop = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const shopId = req.params.shopId
    const shopName = req.body.shopName;
    const registration = req.body.registration;
    const ownerPhoneNo = req.body.ownerPhoneNo;
    const ownerCnic = req.body.ownerCnic;
    const area = req.body.area;

    const savedAreas = await Area.findOne({ areaName: area, user: req.userId })
    if (!savedAreas) {
        const error = new Error("No or Wrong Area Provided");
        error.statusCode = 404;
        throw error;
    }
    try {
        const shop = await Shop.findOne({ _id: shopId, user: req.userId });
        if (!shop) {
            const error = new Error("No Shop Found");
            error.statusCode = 404;
            throw error;
        }
        if (shop.user.toString() !== req.userId) {
            const error = new Error("Not Authorized!");
            error.statusCode = 403;
            throw error;
        }

        shop.shopName = shopName;
        shop.registration = registration;
        shop.ownerPhoneNo = ownerPhoneNo;
        shop.ownerCnic = ownerCnic;
        shop.area = area;

        const updatedShop = await shop.save();
        res.status(200).json({ message: "Shop Updated Successfully!", shop: updatedShop });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteShop = async (req, res, next) => {
    const shopId = req.params.shopId;
    try {
        const shop = await Shop.findOne({ _id: shopId, user: req.userId });
        if (!shop) {
            const error = new Error("No Shop found!");
            error.statusCode = 404;
            throw error;
        }
        if (shop.user.toString() !== req.userId) {
            const error = new Error("Not Authorized!");
            error.statusCode = 422;
            throw error;
        }
        await Shop.findOneAndDelete({ _id: shopId, user: req.userId });
        const user = await User.findById(
            req.userId
        )
        user.shops.pull(shopId);
        await user.save();
        res.status(200).json({ message: "Shop Deleted!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}