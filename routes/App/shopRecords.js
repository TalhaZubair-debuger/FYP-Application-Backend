const express = require("express");
const isAuth = require("../../middlewares/is-auth");
const { body } = require("express-validator");
const shopRecordsController = require("../../controllers/App/shopRecords");

const router = express.Router();

router.post("/add-records/:shopId", isAuth, shopRecordsController.addShopRecords);

router.get("/get-records/:shopId", isAuth, shopRecordsController.getRecords);

module.exports = router;