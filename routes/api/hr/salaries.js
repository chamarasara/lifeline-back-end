const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const SalariesController = require('../../../controllers/hr/salaries')
//New salary
router.post('/new-salary', SalariesController.add_new_salary);
//All salaries
router.get('/all-salaries', SalariesController.get_all_salaries);
//Get single salary
router.get('/single-salary/:id', SalariesController.get_one_salary);
//Update salary
router.patch('/update-salary/:id', SalariesController.update_salary);
//Delete salary
router.delete('/delete-salary/:_id', SalariesController.delete_salary);
//Print salary
router.get('/print-salary/:id', SalariesController.print_salary);
//Search salary 
router.post('/search-salary', SalariesController.search_salaries);
module.exports = router;