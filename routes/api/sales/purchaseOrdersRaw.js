const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const auth = require('../../../middleware/auth')
const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/purchaseordersraw/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
//     }
// })
// const fileFilter = (req, file, cb) => {
//     // reject a file
//     if (file.mimetype === 'application/pdf') {
//         cb(null, true)
//     } else {
//         cb(new Error('Only pdf files allowed'), false)
//     }
// }
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 4
//     },
//     fileFilter: fileFilter
// })


const PurchaseOrdersRawController = require('../../../controllers/sales/purchaseOrdersRaw')
//New purchase order
router.post('/new-purchase-order-raw', PurchaseOrdersRawController.purchase_order_raw_add_new);
//All purchase orders
router.get('/all-purchase-orders-raw', PurchaseOrdersRawController.purchase_orders_raw_get_all);
//Get single purchase order
router.get('/single-purchase-order-raw/:id', PurchaseOrdersRawController.purchase_orders_raw_get_one);
//Update purchase order
router.patch('/update-purchase-order-raw/:id', PurchaseOrdersRawController.update_purchase_order_raw);
//Update purchase order state
router.patch('/update-purchase-order-state-raw/:id', PurchaseOrdersRawController.update_purchase_order_state_raw);
//GRN 
router.patch('/grn-purchase-order-raw/:id', PurchaseOrdersRawController.grn_details);
//Returns details
router.patch('/returns-purchase-order-raw/:id', PurchaseOrdersRawController.returns_details);
//Delete purchase order
router.delete('/delete-purchase-order-raw/:id', PurchaseOrdersRawController.delete_purchase_order_raw);
//Search
router.post('/search-purchase-order-raw/', PurchaseOrdersRawController.search_purchase_orders_raw);
//Print purchase order
router.get('/print-purchase-order-raw/:id', PurchaseOrdersRawController.print_purchase_orders_raw);
//Print grn
router.get('/print-grn-raw/:id/:grnId', PurchaseOrdersRawController.print_purchase_orders_raw_grn);

module.exports = router;