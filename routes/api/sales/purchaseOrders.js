const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const PurchaseOrdersController = require('../../../controllers/sales/purchaseOrders')
//New purchase order
router.post('/new-purchase-order', PurchaseOrdersController.purchase_order_add_new);
//All purchase orders
router.get('/all-purchase-orders', PurchaseOrdersController.purchase_orders_get_all);
//Get single purchase order
router.get('/single-purchase-order/:id', PurchaseOrdersController.purchase_orders_get_one);
//Update purchase order
router.patch('/update-purchase-order/:id', PurchaseOrdersController.update_purchase_order);
//Delete purchase order
router.delete('/delete-purchase-order/:id', PurchaseOrdersController.delete_purchase_order);

module.exports = router;