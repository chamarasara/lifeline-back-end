const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const PurchaseOrdersRawController = require('../../../controllers/sales/purchaseOrdersRaw')
//New purchase order
router.post('/new-purchase-order-raw', PurchaseOrdersRawController.purchase_order_raw_add_new);
//All purchase orders
router.get('/all-purchase-orders-raw', PurchaseOrdersRawController.purchase_orders_raw_get_all);
//Get single purchase order
router.get('/single-purchase-order-raw/:id', PurchaseOrdersRawController.purchase_orders_raw_get_one);
//Update purchase order
router.patch('/update-purchase-order-raw/:id', PurchaseOrdersRawController.update_purchase_order_raw);
//Delete purchase order
router.delete('/delete-purchase-order-raw/:id', PurchaseOrdersRawController.delete_purchase_order_raw);
//Search
router.post('/search-purchase-order-raw/', PurchaseOrdersRawController.search_purchase_orders_raw);

module.exports = router;