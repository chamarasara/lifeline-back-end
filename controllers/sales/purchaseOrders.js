const PurchaseOrders = require('../../models/purchaseOrders/purchaseOrders');
const mongoose = require('mongoose');

//Add new purchase order
exports.purchase_order_add_new = (req, res, next) => {
    console.log(req.body)
    const purchaseOrders = new PurchaseOrders({
        id: mongoose.Types.ObjectId(),
        customerId: req.body.customerId,
        userId: req.body.userId,
        products: req.body.products
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
                from: 'customermasters',
                localField: 'customerId',
                foreignField: 'id',
                as: 'customer'
            }
        },
        {
            '$lookup': {
                from: 'productmasters',
                localField: 'products.id',
                foreignField: 'id',
                as: 'productsList'
            }
        }]
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
                    from: 'customermasters',
                    localField: 'customerId',
                    foreignField: 'id',
                    as: 'customer'
                }
            },
            {
                '$lookup': {
                    from: 'productmasters',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'productsList'
                }
            }]
    )
        .exec()
        .then(doc => {
            if (doc) {
                console.log("doccccc", doc)
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
exports.update_purchase_order = (req, res, next) => {

    const id = req.params.id;
    console.log("*******id",id)
    console.log("req body", req.body);
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }
    
    PurchaseOrders.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            PurchaseOrders.findById(id)
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
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
}
//Delete raw material
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