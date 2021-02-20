const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const DistributorController = require('../../../controllers/master/distributorMaster')
//New raw material
router.post('/new-distributor', DistributorController.add_new_distributor);
//All raw materials
router.get('/all-distributors', DistributorController.distributor_get_all);
//Get single raw material
router.get('/single-distributor/:id', DistributorController.get_one_distributor);
//Update raw material
router.patch('/update-distributor/:id', DistributorController.update_distributor);
//Delete raw material
router.delete('/delete-distributor/:_id', DistributorController.delete_distributor);

module.exports = router;