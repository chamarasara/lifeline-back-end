const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const ProductsMasterController = require('../../../controllers/master/productMaster')
//New packing material
router.post('/new-product', ProductsMasterController.product_master_good_add_new);
//All packing materials
router.get('/all-products', ProductsMasterController.product_master_get_all);
//Get single packing material
router.get('/single-product/:_id', ProductsMasterController.product_master_get_one);
//Update packing material
router.patch('/update-product/:_id', ProductsMasterController.product_master_update);
//Delete packing material
router.delete('/delete-product/:_id', ProductsMasterController.product_master_delete);

module.exports = router;