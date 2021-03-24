const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const InvoicesController = require('../../../controllers/sales/returnInvoices')
//New return invoice
router.post('/new-return-invoice', InvoicesController.add_new_returnInvoice);
//All return invoices
router.get('/all-return-invoices', InvoicesController.all_return_invoices);
//Get single return invoice
router.get('/single-return-invoice/:id', InvoicesController.single_return_invoice);
//Update return invoice
router.patch('/update-return-invoice/:id', InvoicesController.update_return_invoice);
//Delete return invoice
router.delete('/delete-return-invoice/:id', InvoicesController.delete_return_invoice);
//Search
router.post('/search-return-invoices/', InvoicesController.search_return_invoices);
//Print return invoice
router.get('/print-return-invoice/:id', InvoicesController.print_return_invoice);

module.exports = router;