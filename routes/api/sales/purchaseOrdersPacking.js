const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const multer = require('multer');
const auth = require('../../../middleware/auth')

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/purchaseorderspacking/')
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

const PurchaseOrdersPackingController = require('../../../controllers/sales/purchaseOrdersPacking')
//New purchase order
router.post('/new-purchase-order-packing',PurchaseOrdersPackingController.purchase_order_packing_add_new);
//All purchase orders
router.get('/all-purchase-orders-packing', PurchaseOrdersPackingController.purchase_orders_packing_get_all);
//Get single purchase order
router.get('/single-purchase-order-packing/:id', PurchaseOrdersPackingController.purchase_orders_packing_get_one);
//Update purchase order
router.patch('/update-purchase-order-packing/:id', PurchaseOrdersPackingController.update_purchase_order_packing);
//Update purchase order state 
router.patch('/update-purchase-order-state-packing/:id',  PurchaseOrdersPackingController.update_purchase_order_state_packing);
//GRN 
router.patch('/grn-purchase-order-packing/:id', PurchaseOrdersPackingController.grn_details);
//Bank payments
router.patch('/bank-payments-purchase-order-packing/:id', PurchaseOrdersPackingController.bank_payments_details);
//Cash payments
router.patch('/cash-payments-purchase-order-packing/:id', PurchaseOrdersPackingController.cash_payments_details);
//Bank payments additional charges 
router.patch('/additional-charges-bank-payments-purchase-order-packing/:id', PurchaseOrdersPackingController.additional_charges_bank_payments_details);
//Cash payments additonal charges 
router.patch('/additional-charges-cash-payments-purchase-order-packing/:id', PurchaseOrdersPackingController.additional_charges_cash_payments_details);
//Delete purchase order
router.delete('/delete-purchase-order-packing/:id', PurchaseOrdersPackingController.delete_purchase_order_packing);
//Search
router.post('/search-purchase-order-packing/', PurchaseOrdersPackingController.search_purchase_orders_packing);
//Print purchase order
router.get('/print-purchase-order-packing/:id', PurchaseOrdersPackingController.print_purchase_orders_packing);
module.exports = router;