const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const InvoicesController = require('../../../controllers/sales/invoices')
//New purchase order
router.post('/new-invoice', InvoicesController.add_new_invoice);
//All Invoices
router.get('/all-invoices', InvoicesController.all_invoices);
//Get single Invoice
router.get('/single-invoice/:id', InvoicesController.single_invoice);
//Update Invoice
router.patch('/update-invoice/:id', InvoicesController.update_invoice);
//Create and update dispatch note
router.patch('/update-dispatch-note/:id', InvoicesController.dispatch_note);
//Delete Invoice
router.delete('/delete-invoice/:id', InvoicesController.delete_invoice);
//Search
router.post('/search-invoices/', InvoicesController.search_invoices);
//Print invoice
router.get('/print-invoice/:id', InvoicesController.print_invoice);
//Print dispatch note
router.get('/print-print-dispatch-note/:id/:dispatchId', InvoicesController.print_dispatch_note);

module.exports = router;