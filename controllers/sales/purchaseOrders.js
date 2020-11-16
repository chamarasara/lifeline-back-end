const PurchaseOrders = require('../../models/purchaseOrders/purchaseOrders');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');
const Supplier = require('../../models/master/SupplierMaster');
//Add new purchase order
exports.purchase_order_add_new = (req, res, next) => {
    console.log(req.body)
    const purchaseOrders = new PurchaseOrders({
        id: mongoose.Types.ObjectId(),
        supplierId: req.body.supplierId,
        userId: req.body.userId,
        rawMaterials: req.body.rawMaterials,
        packingMaterials: req.body.packingMaterials,
        date: moment().format('DD/MM/YYYY, h:mm:ss a'),
    });
    purchaseOrders.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        purchaseOrders: purchaseOrders
    });
}
//Get all raw materials
exports.purchase_orders_get_all = (req, res, next) => {
    //PurchaseOrders.find()
    PurchaseOrders.aggregate(
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
        },
        {
            '$lookup': {
                from: 'packingmaterialmasters',
                localField: 'packingMaterials.id',
                foreignField: 'id',
                as: 'packingMaterialsList'
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
exports.purchase_orders_get_one = (req, res, next) => {

    //PurchaseOrders.findById(req.params._id)
    PurchaseOrders.aggregate(
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
            },
            {
                '$lookup': {
                    from: 'packingmaterialmasters',
                    localField: 'packingMaterials.id',
                    foreignField: 'id',
                    as: 'packingMaterialsList'
                }
            }]
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
exports.update_purchase_order = (req, res, next) => {

    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    PurchaseOrders.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            PurchaseOrders.findById(id)
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
exports.delete_purchase_order = (req, res, next) => {
    const id = req.params.id;
    PurchaseOrders.remove({ _id: id })
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
exports.search_purchase_orders = (req, res, next) => {
    const startDate = moment(req.body.formValues.startDate).format('DD/MM/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('DD/MM/YYYY')
    console.log("dates", startDate, " ", endDate)
    PurchaseOrders.aggregate(
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
                '$lookup': {
                    from: 'packingmaterialmasters',
                    localField: 'packingMaterials.id',
                    foreignField: 'id',
                    as: 'searchPackingMaterial'
                }
            },
            {
                '$match': {
                    $or: [
                        { "searchPackingMaterial.materialName": req.body.formValues.searchText },
                        { "searchRawMaterial.materialName": req.body.formValues.searchText },
                        { "searchSupplier.supplierName": req.body.formValues.searchText },
                        {
                            date: {
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