const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const BankAccountsController = require('../../../controllers/master/bankAccountsMaster')
//New bank account
router.post('/new-bank-account', BankAccountsController.new_bank_account);
//All bank accounts
router.get('/all-bank-accounts', BankAccountsController.get_all_bank_accounts);
//Get single bank account
router.get('/single-bank-account/:id', BankAccountsController.get_single_bank_account);
//Update upadate bank account
router.patch('/update-bank-account/:id', BankAccountsController.update_bank_account) ;
//Delete bank account
router.patch('/delete-bank-account/:id', BankAccountsController.delete_bank_account);

module.exports = router;