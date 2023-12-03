const express = require("express");
const isAuth = require("../middlewares/is-auth");
const { body } = require("express-validator");
const vendorRecordsController  = require("../controllers/vendorRecords");

const router = express.Router();

router.post("/add-records/:vendorId", isAuth, vendorRecordsController.addVendorRecords);

router.get("/get-records/:vendorId", isAuth, vendorRecordsController.getVendorRecords);

module.exports = router;