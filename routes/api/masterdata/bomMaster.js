const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const BomController = require('../../../controllers/master/bomMaster')
//New raw material
router.post('/new-bom', BomController.add_new_bom);
//All raw materials
router.get('/all-boms', BomController.bom_get_all);
//Get single raw material
router.get('/single-bom/:id', BomController.get_one_bom);
//Update raw material
router.patch('/update-bom/:id', BomController.update_bom);
//Delete raw material
router.delete('/delete-bom/:_id', BomController.delete_bom);

module.exports = router;