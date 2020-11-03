const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const SemiFinishGoodController = require('../../../controllers/master/semiFinishGoodsMaster')
//New packing material
router.post('/new-semi-finish-good-material', SemiFinishGoodController.semi_finish_good_add_new);
//All packing materials
router.get('/all-semi-finish-good-materials', SemiFinishGoodController.semi_finish_good_get_all);
//Get single packing material
router.get('/single-semi-finish-good-material/:_id', SemiFinishGoodController.semi_finish_good_get_one);
//Update packing material
router.patch('/update-semi-finish-good-material/:_id', SemiFinishGoodController.update_semi_finish_good);
//Delete packing material
router.delete('/delete-semi-finish-good-material/:_id', SemiFinishGoodController.delete_semi_finish_good);

module.exports = router;