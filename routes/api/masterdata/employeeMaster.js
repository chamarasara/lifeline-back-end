const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const EmployeeMasterController = require('../../../controllers/master/employeeMaster')
//New employee
router.post('/new-employee', EmployeeMasterController.add_new_employee);
//All employees
router.get('/all-employees', EmployeeMasterController.get_all_employees);
//Get single employee
router.get('/single-employee/:id', EmployeeMasterController.get_one_employee);
//Update employee
router.patch('/update-employee/:id', EmployeeMasterController.update_employee);
//Delete employee
router.delete('/delete-employee/:_id', EmployeeMasterController.delete_employee);

module.exports = router;