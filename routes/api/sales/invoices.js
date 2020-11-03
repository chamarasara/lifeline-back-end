const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const InvoicesController = require('../../../controllers/sales/invoices')
//New purchase order
router.post('/new-invoice', InvoicesController.add_new_invoice);
//All purchase orders
router.get('/all-invoices', InvoicesController.all_invoices);
//Get single purchase order
router.get('/single-invoice/:id', InvoicesController.single_invoice);
//Update purchase order
router.patch('/update-invoice/:id', InvoicesController.update_invoice);
//Delete purchase order
router.delete('/delete-invoice/:id', InvoicesController.delete_invoice);

module.exports = router;