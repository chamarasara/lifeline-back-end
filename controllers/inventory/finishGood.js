const FinishGoodInventory = require('../../models/inventory/FinishGoodInventory');
const Count = require('../../models/counter/count');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require("fs");
const PDFDocument = require("pdfkit");
const Finishgoodsmasters = require('../../models/master/FinishGoodsMaster');
//Add new purchase order
exports.add_new_finishgood_inventory = (req, res, next) => {

    Count.findOneAndUpdate({ id: 'refNumberFgInventory' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {

        if (doc) {
            //generate invoice number
            function getRefNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                //console.log("IN" + year.toString() + month.toString() + doc.seq)
                //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
                return + year.toString() + month.toString() + doc.seq
            }
            Finishgoodsmasters.find({ 'id': req.body.productId },
                function (err, docs) {

                    const productData = docs[0]
                    console.log("Product data", productData)
                    const finishGoodInventory = new FinishGoodInventory({
                        id: mongoose.Types.ObjectId(),
                        productId: req.body.productId,
                        batchNumber: req.body.batchNumber,
                        sellingPrice: productData.sellingPrice,
                        manufacturingDate: req.body.manufacturingDate,
                        reasonForDelay: req.body.reasonForDelay,
                        quantity: req.body.quantity,
                        remainingQuantity: req.body.quantity,
                        finishGoodDescription: req.body.finishGoodDescription,
                        userId: req.body.user.user.userId,
                        userName: req.body.user.user.userName,
                        userRole: req.body.user.user.userRole,
                        refNumberFgInventory: getRefNumber()
                    });
                    finishGoodInventory.save()
                        .then(result => {
                            //console.log(result);
                        })
                        .catch(err => console.log(err));
                    res.status(200).json({
                        //message: 'New Raw Material successfully created.',
                        finishGoodInventory: finishGoodInventory
                    });
                }
            )
        }
    })
}
//Get all invoices
exports.all_finishgoods_inventory = (req, res, next) => {
    FinishGoodInventory.aggregate(
        [
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'productId',
                    foreignField: 'id',
                    as: 'productDetails'
                }
            }
        ]
    )
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
exports.single_finishgood_inventory = (req, res, next) => {

    FinishGoodInventory.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'productId',
                    foreignField: 'id',
                    as: 'productDetails'
                }
            }

        ]
    )
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: "No valid ID found" })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

//Update raw material
exports.update_finishgood_inventory = (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    FinishGoodInventory.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            FinishGoodInventory.findById(id)
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {
                    //console.log(err)
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            //console.log(err)
            res.status(500).json({
                error: err
            });
        });
}
//Delete invoice
exports.delete_finishgood_inventory = (req, res, next) => {
    const id = req.params.id;
    FinishGoodInventory.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
//Search invoices
exports.search_finishgood_inventory = (req, res, next) => {
    console.log(req.body)
    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    FinishGoodInventory.aggregate(
        [
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'productId',
                    foreignField: 'id',
                    as: 'productDetails'
                }
            },
            {
                '$match': {
                    $or: [
                        { "productDetails.productName": req.body.formValues.searchText },
                        {
                            createdAt: {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate)
                            }
                        }
                    ]

                }
            }
        ]
    )
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
