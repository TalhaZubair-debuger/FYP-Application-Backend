const Vendor = require("../models/vendors");
const { validationResult } = require("express-validator");

exports.addVendor = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const vendorName = req.body.vendorName;
    const vendorContact = req.body.vendorContact;

    try {
    const savedVendor = await Vendor.findOne({vendorName, user: req.userId});
    if (savedVendor !== null) {
        const error = new Error("Vendor already exists!");
        error.statusCode = 409;
        throw error;
    }
    const vendor = new Vendor({
        vendorName,
        vendorContact,
        user: req.userId
    })
        const response = await vendor.save();
        console.log(JSON.stringify(response));
        res.status(200).json({ message: "Vendor created successfully!", vendor: vendor });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getAllVendors = async (req, res, next) => {
    const vendors = await Vendor.find({ user: req.userId });
    if (vendors.length === 0) {
        res.status(404).json({ message: "No Vendors found" });
    }
    else {
        res.status(200).json({ message: "Vendors found", vendors: vendors });
    }
}

exports.getTopVendors = async (req, res, next) => {
    const vendors = await Vendor.find({ user: req.userId }).limit(3);
    if (vendors.length === 0) {
        res.status(404).json({ message: "No Vendors found" });
    }
    else {
        res.status(200).json({ message: "Top Vendors found", vendors: vendors });
    }
}

exports.getVendor = async (req, res, next) => {
    const vendorId = req.params.vendorId;
    const vendor = await Vendor.findOne({ _id: vendorId, user: req.userId });
    if (!vendor) {
        res.status(404).json({ message: "No Vendor found" });
    }
    else {
        res.status(201).json({ message: "Vendor found", vendor: vendor });
    }
}

exports.addVendorProduct = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const productName = req.body.productName;
    const productPrice = req.body.productPrice;
    const vendorId = req.params.vendorId;

    try {
    const vendor = await Vendor.findOne({_id: vendorId, user: req.userId});
    if (vendor) {
        const Product = {
            productName,
            productPrice
        }
        vendor.vendorProducts.push(Product);
        await vendor.save();
        res.status(201).json({ message: "Vendor Product added successfully!" });
    }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteVendorProduct = async (req, res, next) => {
    const vendorId = req.query.vendorId;
    const productName = req.query.productName;
    try {
        const vendor = await Vendor.findOne({ _id: vendorId });
        if (!vendor) {
            const error = new Error("No Vendor Product found!");
            error.statusCode = 404;
            throw error;
        }
        vendor.vendorProducts.pop(productName);
        await vendor.save();
        res.status(200).json({ message: "Vendor Product Deleted!", vendor: vendor });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateVendorDetails = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }
    const vendorId = req.params.vendorId;
    const vendorName = req.body.vendorName;
    const vendorContact = req.body.vendorContact;

    try {
        const vendor = await Vendor.findOne({ _id: vendorId, user: req.userId });
        if (!vendor) {
            const error = new Error("No Vendor Found");
            error.statusCode = 404;
            throw error;
        }

        vendor.vendorName = vendorName;
        vendor.vendorContact = vendorContact;

        const updatedVendor = await vendor.save();
        res.status(201).json({ message: "Vendor Updated Successfully!", vendor: updatedVendor });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}
