const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const FinishGoodController = require('../../../controllers/master/finishGoodMaster')
//New packing material
router.post('/new-finish-good-material', FinishGoodController.finish_good_add_new);
//All packing materials
router.get('/all-finish-good-materials', FinishGoodController.finish_good_get_all);
//Get single packing material
router.get('/single-finish-good-material/:_id', FinishGoodController.finish_good_get_one);
//Update packing material
router.patch('/update-finish-good-material/:_id', FinishGoodController.update_finish_good);
//Delete packing material
router.delete('/delete-finish-good-material/:_id', FinishGoodController.delete_finish_good);

module.exports = router;