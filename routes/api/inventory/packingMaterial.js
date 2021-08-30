const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const PackingMaterialInventroyController = require('../../../controllers/inventory/packingMaterial')
//New purchase order
router.post('/new-pakcing-material-inventory', PackingMaterialInventroyController.add_new_packingmaterial_inventory);
//All purchase orders
router.get('/all-packing-materials-inventory', PackingMaterialInventroyController.all_packingmaterial_inventory);
//Get single purchase order
router.get('/single-packing-material-inventory/:id', PackingMaterialInventroyController.single_packingmaterial_inventory);
//Get GRN by purchase order
router.get('/grn-by-purchase-order-packing/:id', PackingMaterialInventroyController.grn_by_purchase_order);
//Get single GRN 
router.get('/single-grn-packing/:id', PackingMaterialInventroyController.single_packingmaterial_inventory);
//Print single GRN 
router.get('/print-grn-packing/:id', PackingMaterialInventroyController.print_grn_packingmaterial_inventory);
//Search
router.post('/search-packing-material-inventory/', PackingMaterialInventroyController.search_packingmaterial_inventory);

module.exports = router;