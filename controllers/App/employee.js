const Employee = require("../../models/App/employee");
const bcrypt = require("bcryptjs");
const User = require("../../models/App/user");
const { validationResult } = require("express-validator");


exports.postAddEmployee = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed, data entered in wrong format.");
        error.statusCode = 422;
        throw error;
    }

    const name = req.body.name;
    const contact = req.body.contact;
    const email = req.body.email;
    const password = req.body.password;
    const employer = req.userId;
    const designation = req.body.designation;
    const area = req.body.area;

    try {
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            res.status(429).json({ message: "Email already exists!" });
            return;
        }
        const employeeCheck = await Employee.findOne({ employer, email });
        if (employeeCheck) {
            res.status(429).json({ message: "Employee Email already exists!" });
            return;
        }
        let newEmployee;
        const hashedPassword = await bcrypt.hash(password, 12);
        if (area) {
            newEmployee = new Employee({
                name,
                contact,
                email,
                password: hashedPassword,
                employer,
                designation,
                area
            })
        } else {
            newEmployee = new Employee({
                name,
                contact,
                email,
                password: hashedPassword,
                employer,
                designation
            })
        }
        await newEmployee.save();

        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "Error fecthing user details!" });
            return;
        }
        const employee = await Employee.findOne({ employer, email })

        user.employees.push({ employeeId: employee._id })
        await user.save();
        res.status(200).json({ message: "New employee added!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.patchEditEmployee = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(403).json({ message: "Form Filled incorrectly!" })
    }

    const name = req.body.name;
    const contact = req.body.contact;
    const email = req.body.email;
    const designation = req.body.designation;
    const area = req.body.area;

    const employeeId = req.params.employeeId;

    try {
        const employeeCheck = await Employee.findById(employeeId);
        if (!employeeCheck) {
            res.status(404).json({ message: "Error finding employee!" });
            return;
        }
        const employee = await Employee.findById(employeeId);

        employee.name = name;
        employee.contact = contact;
        employee.email = email;
        employee.designation = designation;
        if (area != null) {
            employee.area = area;
        }

        await employee.save();

        res.status(200).json({ message: "Employee Edited!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.deleteEmployee = async (req, res, next) => {
    const employeeId = req.params.employeeId;

    try {
        const employeeCheck = await Employee.findById(employeeId);
        if (!employeeCheck) {
            res.status(404).json({ message: "Error finding employee!" });
            return;
        }
        await Employee.findByIdAndRemove(employeeId);

        res.status(200).json({ message: "Employee Deleted!" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getEmployee = async (req, res, next) => {
    const employeeId = req.params.employeeId;

    try {
        const employeeCheck = await Employee.findById(employeeId);
        if (!employeeCheck) {
            res.status(404).json({ message: "Employee not found!" });
            return;
        }

        res.status(200).json({ message: "Employee Found!", employee: employeeCheck });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getAllEmployees = async (req, res, next) => {
    try {
        const employeeCheck = await Employee.find({ employer: req.userId });
        if (!employeeCheck) {
            res.status(404).json({ message: "Employees not found!" });
            return;
        }

        res.status(200).json({ message: "Employees Found!", employees: employeeCheck });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}