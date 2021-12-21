const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

//Controllers
const InvoicesController = require('../../../controllers/sales/invoices')
//Middlewares
const InventoryMiddleware = require('../../../middleware/inventory/fifo')

//New purchase order
router.post('/new-invoice', InvoicesController.add_new_invoice);
//All Invoices
router.get('/all-invoices', InvoicesController.all_invoices);
//Get single Invoice
router.get('/single-invoice/:id', InvoicesController.single_invoice);
//Update Invoice
router.patch('/update-invoice/:id', InvoicesController.update_invoice);
//Create and update dispatch note
router.patch('/update-dispatch-note/:id', InvoicesController.dispatch_note, InventoryMiddleware.fifo );
//Delete Invoice
router.delete('/delete-invoice/:id', InvoicesController.delete_invoice);
//Bank payments
router.patch('/bank-payments-invoice/:id', InvoicesController.bank_payments_details);
//Cash payments
router.patch('/cash-payments-invoice/:id', InvoicesController.cash_payments_details);
//Search
router.post('/search-invoices/', InvoicesController.search_invoices);
//Print invoice
router.get('/print-invoice/:id', InvoicesController.print_invoice);
//Print dispatch note
router.get('/print-print-dispatch-note/:id/:dispatchId', InvoicesController.print_dispatch_note);

module.exports = router;