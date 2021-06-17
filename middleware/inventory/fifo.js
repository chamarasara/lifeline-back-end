const FinishGoodInventory = require("../../models/inventory/FinishGoodInventory");
const FinishgoodsMasters = require('../../models/master/FinishGoodsMaster')
const moment = require('moment');
const mongoose = require('mongoose');

exports.fifo = (req, res, next) => {
    req.setTimeout(2147483647);
    const productIdList = []
    const productQuantityList = []

    for (let i = 0; i < req.body.products.length; i++) {
        productIdList.push(mongoose.Types.ObjectId(req.body.products[i].id));
        console.log("id ", req.body.products[i].id)
    }

    for (let i = 0; i < req.body.products.length; i++) {
        productQuantityList.push(parseInt(req.body.products[i].quantity));
        console.log("quantity ", req.body.products[i].quantity)
    }

    for (let i = 0; i < req.body.products.length; i++) {
        console.log("req.body.products.length ", req.body.products.length)

        FinishGoodInventory.find(
            {
                'productId': req.body.products[i].id,
                'remainingQuantity': { $gt: 0 }
            },
            (function (err, docs) {

                for (let x = 0; x < docs.length; x++) {
                    // console.log("productQuantityList[j]", productQuantityList[j])
                    // console.log("docs[x].remainingQuantity", docs[x].remainingQuantity)

                    if (req.body.products[i].id == docs[x].productId && req.body.products[i].quantity == docs[x].remainingQuantity && req.body.products[i].quantity > 0) {
                        console.log(req.body.products[i].quantity, "=====", docs[x].remainingQuantity)
                        let setValue = 0
                        FinishGoodInventory.findOneAndUpdate(
                            { 'id': docs[x].id },
                            {
                                $set: { "remainingQuantity": setValue },
                                $push: { "issuedItems": { "Date": Date(), "invoiceId": req.body.id, "invoiceNumber": req.body.invoiceNumber, quantity: req.body.products[i].quantity } }
                            },
                        )
                            .exec()
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            });
                        console.log("Set value", setValue)
                        { break }
                    }
                    if (req.body.products[i].id == docs[x].productId && req.body.products[i].quantity < docs[x].remainingQuantity && req.body.products[i].quantity > 0) {
                        console.log(req.body.products[i].quantity, "<<<<<", docs[x].remainingQuantity)
                        let setValue = docs[x].remainingQuantity - req.body.products[i].quantity
                        FinishGoodInventory.findOneAndUpdate(
                            { 'id': docs[x].id },
                            {
                                $set: { "remainingQuantity": setValue },
                                $push: { "issuedItems": { "Date": Date(), "invoiceId": req.body.id, "invoiceNumber": req.body.invoiceNumber, quantity: req.body.products[i].quantity  } }
                            }
                        ).exec()
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            });
                        { break }
                    }
                    if (req.body.products[i].id == docs[x].productId && req.body.products[i].quantity > docs[x].remainingQuantity && req.body.products[i].quantity > 0) {
                        console.log(req.body.products[i].quantity, ">>>>>", docs[x].remainingQuantity)
                        req.body.products[i].quantity = req.body.products[i].quantity - docs[x].remainingQuantity
                        let setValue = 0
                        FinishGoodInventory.findOneAndUpdate(
                            { 'id': docs[x].id },
                            {
                                $set: { "remainingQuantity": setValue },
                                $push: {
                                    "issuedItems": { "Date": Date(), "invoiceId": req.body.id, "invoiceNumber": req.body.invoiceNumber, quantity: docs[x].quantity }
                                }
                            }
                        )
                            .exec()
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            });
                    }

                }
            })
        )
    }
}