const Invoices = require('../../models/invoices/invoices');
const mongoose = require('mongoose');
const moment = require('moment');

//Add new purchase order
exports.add_new_invoice = (req, res, next) => {
    console.log(req.body)
    const invoices = new Invoices({
        id: mongoose.Types.ObjectId(),
        customerId: req.body.customerId,
        userId: req.body.userId,
        products: req.body.products,
    });
    invoices.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        invoices: invoices
    });
}
//Get all raw materials
exports.all_invoices = (req, res, next) => {
    Invoices.aggregate(
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
exports.single_invoice = (req, res, next) => {

    Invoices.aggregate(
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
exports.update_invoice = (req, res, next) => {

    const id = req.params.id;
    console.log(id)
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Invoices.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            Invoices.findById(id)
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
//Delete raw material
exports.delete_invoice = (req, res, next) => {
    const id = req.params.id;
    Invoices.remove({ _id: id })
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
exports.search_invoices = (req, res, next) => {
    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    Invoices.aggregate(
        [
            {
                '$lookup': {
                    from: 'customermasters',
                    localField: 'customerId',
                    foreignField: 'id',
                    as: 'searchCustomer'
                }
            },
            {
                '$lookup': {
                    from: 'productmasters',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'searchProducts'
                }
            },            
            {
                '$match': {
                    $or: [
                        { "searchProducts.productName": req.body.formValues.searchText },
                        { "searchCustomer.customerName": req.body.formValues.searchText },
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