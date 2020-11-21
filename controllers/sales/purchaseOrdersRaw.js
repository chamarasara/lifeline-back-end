const PurchaseOrdersRaw = require('../../models/purchaseOrders/purchaseOrdersRaw');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');
//const Supplier = require('../../models/master/SupplierMaster');
//Add new purchase order
exports.purchase_order_raw_add_new = (req, res, next) => {
    console.log(req.body)
    const purchaseOrdersRaw = new PurchaseOrdersRaw({
        id: mongoose.Types.ObjectId(),
        supplierId: req.body.supplierId,
        userId: req.body.userId,
        rawMaterials: req.body.rawMaterials,
        packingMaterials: req.body.packingMaterials
    });
    purchaseOrdersRaw.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        purchaseOrdersRaw: purchaseOrdersRaw
    });
}
//Get all raw materials
exports.purchase_orders_raw_get_all = (req, res, next) => {
    //PurchaseOrders.find()
    PurchaseOrdersRaw.aggregate(
        [{
            '$lookup': {
                from: 'suppliermasters',
                localField: 'supplierId',
                foreignField: 'id',
                as: 'supplier'
            }
        },
        {
            '$lookup': {
                from: 'rawmaterialmasters',
                localField: 'rawMaterials.id',
                foreignField: 'id',
                as: 'rawMaterialsList'
            }
        }
        ]
    )
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
exports.purchase_orders_raw_get_one = (req, res, next) => {

    //PurchaseOrders.findById(req.params._id)
    PurchaseOrdersRaw.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
                }
            },
            {
                '$lookup': {
                    from: 'suppliermasters',
                    localField: 'supplierId',
                    foreignField: 'id',
                    as: 'supplier'
                }
            },
            {
                '$lookup': {
                    from: 'rawmaterialmasters',
                    localField: 'rawMaterials.id',
                    foreignField: 'id',
                    as: 'rawMaterialsList'
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

//Update purchase orders
exports.update_purchase_order_raw = (req, res, next) => {

    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    PurchaseOrdersRaw.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            PurchaseOrdersRaw.findById(id)
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
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
}
//Delete purchase orders
exports.delete_purchase_order_raw = (req, res, next) => {
    const id = req.params.id;
    PurchaseOrdersRaw.remove({ _id: id })
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
//Search purchase orders
exports.search_purchase_orders_raw = (req, res, next) => {
    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    console.log("dates", startDate, " ", endDate)
    PurchaseOrdersRaw.aggregate(
        [
            {
                '$lookup': {
                    from: 'suppliermasters',
                    localField: 'supplierId',
                    foreignField: 'id',
                    as: 'searchSupplier'
                }
            },
            {
                '$lookup': {
                    from: 'rawmaterialmasters',
                    localField: 'rawMaterials.id',
                    foreignField: 'id',
                    as: 'searchRawMaterial'
                }
            },
            {
                '$match': {
                    $or: [
                        { "searchRawMaterial.materialName": req.body.formValues.searchText },
                        { "searchSupplier.companyName": req.body.formValues.searchText },
                        {
                            createdAt: {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate)
                            }
                        }
                    ]

                }
            }
        ])
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}