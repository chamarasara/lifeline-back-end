const PurchaseOrdersPacking = require('../../models/purchaseOrders/purchaseOrdersPacking');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');
//const Supplier = require('../../models/master/SupplierMaster');
//Add new purchase order
exports.purchase_order_packing_add_new = (req, res, next) => {
    console.log(req.body)
    const purchaseOrdersPacking = new PurchaseOrdersPacking({
        id: mongoose.Types.ObjectId(),
        supplierId: req.body.supplierId,
        userId: req.body.userId,
        packingMaterials: req.body.packingMaterials
    });
    purchaseOrdersPacking.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        purchaseOrdersPacking: purchaseOrdersPacking
    });
}
//Get all raw materials
exports.purchase_orders_packing_get_all = (req, res, next) => {
    //PurchaseOrders.find()
    PurchaseOrdersPacking.aggregate(
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
exports.purchase_orders_packing_get_one = (req, res, next) => {

    //PurchaseOrders.findById(req.params._id)
    PurchaseOrdersPacking.aggregate(
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
exports.update_purchase_order_packing = (req, res, next) => {

    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    PurchaseOrdersPacking.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            PurchaseOrdersPacking.findById(id)
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
exports.delete_purchase_order_packing = (req, res, next) => {
    const id = req.params.id;
    PurchaseOrdersPacking.remove({ _id: id })
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
exports.search_purchase_orders_packing = (req, res, next) => {
    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    console.log("dates", startDate, " ", endDate)
    PurchaseOrdersPacking.aggregate(
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