const express = require("express");
const isAuth = require("../../middlewares/is-auth");
const { body } = require("express-validator");
const employeeController = require("../../controllers/App/employee");


const router = express.Router();

router.post("/add-employee", [
        body("email")
            .isEmail()
            .withMessage("Enter a valid email")
            .normalizeEmail(),
        body("password")
            .trim()
            .isLength({ min: 5 }),
        body("name")
            .trim()
            .not()
            .isEmpty(),
        body("contact")
            .isNumeric()
            .isLength({ min: 10 })
            .withMessage("Please enter Phone No. of valid length")
            .not()
            .isEmpty()
], isAuth, employeeController.postAddEmployee);

router.patch("/edit-employee/:employeeId", isAuth, employeeController.patchEditEmployee);

router.delete("/delete-employee/:employeeId", isAuth, employeeController.deleteEmployee);

router.get("/get-employee/:employeeId", isAuth, employeeController.getEmployee);

router.get("/get-all-employees", isAuth, employeeController.getAllEmployees);

module.exports = router;