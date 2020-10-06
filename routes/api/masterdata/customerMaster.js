const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
//const auth = require('../../middleware/auth')

const CustomerMaster = require('../../../models/master/CustomerMaster');

//New userRole
router.post('/new-customer', [
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
            customerName, mobileNo, fax, registerNo, division, email, companyName, state, currency, debitPeriod,
            communicationAddress: {
                city, country, lane, no, postalCode
            },
            registerAddress: {
                city2, country2, lane2, no2, postalCode2
            }
        } = req.body
        try {
            customerMaster = new CustomerMaster({
                customerName, mobileNo, fax, registerNo, division, email, companyName, state, currency, debitPeriod,
                communicationAddress: {
                    city, country, lane, no, postalCode
                },
                registerAddress: {
                    city2, country2, lane2, no2, postalCode2
                }
            })
            //save user role
            await customerMaster.save()
            res.send(customerMaster)

        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    });

router.get('/all-customers', async (req, res) => {
    try {
        const customerMaster = await CustomerMaster.find()
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
router.get('/single-customer/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const customerMaster = await CustomerMaster.findById(id)
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
router.patch('/update-customer/:_id', async (req, res) => {
    try {
        id = req.params._id;
        console.log(req.body)
        const updateOps = {};

        for (const ops in req.body) {
            updateOps[ops.propName] = ops.value;
        }

        CustomerMaster.update({ _id: id }, { $set: req.body })
            .exec()
            .then(result => {
                CustomerMaster.findById(id)
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
router.delete('/delete-customer/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const customerMaster = await CustomerMaster.deleteOne({ _id: id })
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