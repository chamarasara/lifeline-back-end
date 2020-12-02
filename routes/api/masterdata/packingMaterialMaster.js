const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const PackingMaterialController = require('../../../controllers/master/packingMaterialMaster')
//New packing material
router.post('/new-packing-material', PackingMaterialController.packing_material_add_new);
//All packing materials
router.get('/all-packing-materials', PackingMaterialController.packing_materials_get_all);
//Get single packing material
router.get('/single-packing-material/:id', PackingMaterialController.packing_materials_get_one);
//Update packing material
router.patch('/update-packing-material/:_id', PackingMaterialController.update_packing_material);
//Delete packing material
router.delete('/delete-packing-material/:_id', PackingMaterialController.delete_packing_material);

module.exports = router;