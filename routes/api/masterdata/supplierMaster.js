const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const SupplierMaster = require('../../../models/master/SupplierMaster');

//New userRole
router.post('/new-supplier', [
    // check('supplierName', 'User Type ID is required').exists(),
    // check('mobileNo', 'User Type Name is required').exists(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        console.log(req.body)
        const {
            supplierName, mobileNo1, mobileNo2, fax, registerNo, division, email, companyName,state, currency, creditPeriod, 
            communicationAddress: {
                city, country, lane, no, postalCode
            },
            registerAddress: {
                city2, country2, lane2, no2, postalCode2
            }
        } = req.body
        const id = mongoose.Types.ObjectId()
        try {
            supplierMaster = new SupplierMaster({
                supplierName, id, mobileNo1, mobileNo2, fax, registerNo, division, email, companyName, state, currency, creditPeriod, 
                communicationAddress: {
                    city, country, lane, no, postalCode
                },
                registerAddress: {
                    city2, country2, lane2, no2, postalCode2
                }
            })
            //save user role
            await supplierMaster.save()
            res.send(supplierMaster)

        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    });

router.get('/all-suppliers', async (req, res) => {
    try {
        const supplierMaster = await SupplierMaster.find()
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
router.get('/single-supplier/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const supplierMaster = await SupplierMaster.findById(id)
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
router.patch('/update-supplier/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const updateOps = {};

        for (const ops in req.body) {
            updateOps[ops.propName] = ops.value;
        }

        SupplierMaster.update({ _id: id }, { $set: req.body })
            .exec()
            .then(result => {
                SupplierMaster.findById(id)
                    .then(docs => {
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
router.delete('/delete-supplier/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const supplierMaster = await SupplierMaster.deleteOne({ _id: id })
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