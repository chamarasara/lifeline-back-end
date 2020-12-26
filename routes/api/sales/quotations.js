const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const QuotationsController = require('../../../controllers/sales/quotations')
//New purchase order
router.post('/new-quotation', QuotationsController.add_new_quotation);
//All purchase orders
// router.get('/all-quotations', QuotationsController.all_quotations);
// //Get single purchase order
// router.get('/single-quotation/:id', QuotationsController.single_quotation);
// //Update purchase order
// router.patch('/update-quotation/:id', QuotationsController.update_quotation);
// //Delete purchase order
// router.delete('/delete-quotation/:id', QuotationsController.delete_quotation);
// //Search
// router.post('/search-quotation/', QuotationsController.search_quotations);
// //Print invoice
// router.get('/print-quotation/:id', QuotationsController.print_quotation);

module.exports = router;