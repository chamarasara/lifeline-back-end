const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const PurchaseOrdersPackingController = require('../../../controllers/sales/purchaseOrdersPacking')
//New purchase order
router.post('/new-purchase-order-packing', PurchaseOrdersPackingController.purchase_order_packing_add_new);
//All purchase orders
router.get('/all-purchase-orders-packing', PurchaseOrdersPackingController.purchase_orders_packing_get_all);
//Get single purchase order
router.get('/single-purchase-order-packing/:id', PurchaseOrdersPackingController.purchase_orders_packing_get_one);
//Update purchase order
router.patch('/update-purchase-order-packing/:id', PurchaseOrdersPackingController.update_purchase_order_packing);
//Delete purchase order
router.delete('/delete-purchase-order-packing/:id', PurchaseOrdersPackingController.delete_purchase_order_packing);
//Search
router.post('/search-purchase-order-packing/', PurchaseOrdersPackingController.search_purchase_orders_packing);
//Print purchase order
router.get('/print-purchase-order-packing/:id', PurchaseOrdersPackingController.print_purchase_orders_packing);
module.exports = router;