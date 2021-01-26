const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const FinishGoodInventroyController = require('../../../controllers/inventory/finishGood')
//New purchase order
router.post('/new-finish-good-inventory', FinishGoodInventroyController.add_new_finishgood_inventory);
//All purchase orders
router.get('/all-finish-goods-inventory', FinishGoodInventroyController.all_finishgoods_inventory);
//Get single purchase order
router.get('/single-finish-good-inventory/:id', FinishGoodInventroyController.single_finishgood_inventory);
//Update purchase order
router.patch('/update-finish-good-inventory/:id', FinishGoodInventroyController.update_finishgood_inventory);
//Delete purchase order
router.delete('/delete-finish-good-inventory/:id', FinishGoodInventroyController.delete_finishgood_inventory);
//Search
router.post('/search-finish-good-inventory/', FinishGoodInventroyController.search_finishgood_inventory);

module.exports = router;