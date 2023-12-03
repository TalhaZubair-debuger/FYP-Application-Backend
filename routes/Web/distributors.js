const express = require("express");
const { body } = require("express-validator");
const distributorsController  = require("../../controllers/Web/distributors");
const router = express.Router();

router.get("/get-all-distributors", distributorsController.getAllDistributors);

module.exports = router;