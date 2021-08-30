const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const RawMaterialInventroyController = require('../../../controllers/inventory/rawMaterial')
//New purchase order
router.post('/new-raw-material-inventory', RawMaterialInventroyController.add_new_rawmaterial_inventory);
//All purchase orders
router.get('/all-raw-materials-inventory', RawMaterialInventroyController.all_rawmaterial_inventory);
//Get single purchase order
router.get('/single-raw-material-inventory/:id', RawMaterialInventroyController.single_rawmaterial_inventory);
//Get GRN by purchase order
router.get('/grn-by-purchase-order-raw/:id', RawMaterialInventroyController.grn_by_purchase_order);
//Get single GRN 
router.get('/single-grn-raw/:id', RawMaterialInventroyController.single_rawmaterial_inventory);
//Print single GRN 
router.get('/print-grn-raw/:id', RawMaterialInventroyController.print_grn_rawmaterial_inventory);
//Search
router.post('/search-raw-material-inventory/', RawMaterialInventroyController.search_rawmaterial_inventory);

module.exports = router;