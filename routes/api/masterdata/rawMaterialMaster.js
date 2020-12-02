const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const RawMaterialController = require('../../../controllers/master/rawMaterialMaster')
//New raw material
router.post('/new-raw-material', RawMaterialController.raw_material_add_new);
//All raw materials
router.get('/all-raw-materials', RawMaterialController.raw_materials_get_all);
//Get single raw material
router.get('/single-raw-material/:id', RawMaterialController.raw_materials_get_one);
//Update raw material
router.patch('/update-raw-material/:id', RawMaterialController.update_raw_material);
//Delete raw material
router.delete('/delete-raw-material/:_id', RawMaterialController.delete_raw_material);

module.exports = router;