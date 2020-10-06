const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const RawMaterial = require('../../../models/master/RawMaterial');

//New userRole
router.post('/new-raw-material', [
    check('materialName', 'User Type ID is required').exists(),
    check('materialCode', 'User Type Name is required').exists(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        console.log(req.body)
        const {
            materialName, materialCode, materialGroup, baseUnitMeasure, division, suppliers: {
                supplier1, supplier2, supplier3, supplier4, supplier5, supplier6, supplier7, supplier8, supplier9, supplier10
            }
        } = req.body
        try {
            rawMaterial = new RawMaterial({
                materialName,
                materialCode,
                materialGroup,
                baseUnitMeasure,
                division,
                suppliers: { supplier1, supplier2, supplier3, supplier4, supplier5, supplier6, supplier7, supplier8, supplier9, supplier10}
            })
            //save user role
            await rawMaterial.save()
            res.send(rawMaterial)
            res.send('New Raw Material Created')

        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    });

router.get('/all-raw-materials', async (req, res) => {
    try {
        const rawMaterial = await RawMaterial.find()
            .exec()
            .then(docs => {
                console.log(docs);
                res.status(200).json(docs);
            })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})
router.get('/single-raw-material/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const rawMaterial = await RawMaterial.findById(id)
            .exec()
            .then(docs => {
                console.log(docs);
                res.status(200).json(docs);
            })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})
//update user role
router.patch('/update-raw-material/:_id', async (req, res) => {
    try {
        id = req.params._id;
        console.log(req.body)
        const updateOps = {};

        for (const ops in req.body) {
            updateOps[ops.propName] = ops.value;
        }

        RawMaterial.update({ _id: id }, { $set: req.body })
            .exec()
            .then(result => {
                RawMaterial.findById(id)
                    .then(docs => {
                        console.log("docs****", docs)
                        res.status(200).json(docs);
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: err
                        });
                    });
            })


    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})
//Delete user role
router.delete('/delete-raw-material/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const rawMaterial = await RawMaterial.remove({ _id: id })
            .exec()
            .then(docs => {               
                res.status(200).json(docs);
            })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})
module.exports = router;