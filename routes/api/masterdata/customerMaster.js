const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const mongoose = require('mongoose')
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
            customerName, mobileNo1, mobileNo2, fax, registerNo, division, email, companyName, state, currency, creditPeriod, creditAmount,
            communicationAddress: {
                city, country, lane, no, postalCode
            }            
        } = req.body
        const id = mongoose.Types.ObjectId()
        const defult = "defult"
        try {
            customerMaster = new CustomerMaster({
                customerName, id, mobileNo1, mobileNo2, fax, registerNo, division, email, companyName, state, currency, creditPeriod, creditAmount,
                communicationAddress: {
                    city, country, lane, no, postalCode
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
        const updateOps = {
            // customerName: req.body.customerName,
            // mobileNo: req.body.mobileNo, 
            // fax: req.body.fax, 
            // registerNo: req.body.registerNo, 
            // division: req.body.division, 
            // email: req.body.email, 
            // companyName: req.body.companyName, 
            // state: req.body.state, 
            // currency: req.body.currency, 
            // debitPeriod: req.body.debitPeriod,
            // communicationAddress: {
            //     city: req.body.communicationAddress.city, 
            //     country: req.body.communicationAddress.country, 
            //     lane: req.body.communicationAddress.lane, 
            //     no: req.body.communicationAddress.no, 
            //     postalCode: req.body.communicationAddress.postalCode
            // },
            // registerAddress: {
            //     city2: req.body.registerAddress.city2, 
            //     country2: req.body.registerAddress.country2, 
            //     lane2: req.body.registerAddress.lane2, 
            //     no2: req.body.registerAddress.no2, 
            //     postalCode2: req.body.registerAddress.postalCode2
            // }
        };
        for (const ops in Object.values(req.body)) {
            updateOps[ops] = ops;
        }

        CustomerMaster.findByIdAndUpdate({ _id: id }, { $set: req.body })
            .exec()
            .then(result => {
                CustomerMaster.findById(id)
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