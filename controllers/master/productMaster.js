const ProductMaster = require('../../models/master/ProductMaster');
const mongoose = require('mongoose');
//Add new packing material 
exports.product_master_good_add_new = (req, res, next) => {
    console.log(req.body)
    const productMaster = new ProductMaster({
        productName: req.body.productName,
        id: mongoose.Types.ObjectId(),
        productCode: req.body.productCode,
        productUom: req.body.productUom,
        sellingPrice: req.body.sellingPrice,
        directCost: req.body.directCost,
        inDirectCost: req.body.inDirectCost,
        profitMargin: req.body.profitMargin,
        distributorMargin: req.body.distributorMargin,
        retailerMargin: req.body.retailerMargin,
        userId: req.body.userId    
    });
    productMaster.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        productMaster: productMaster
    });
}
//Get all raw materials
exports.product_master_get_all = (req, res, next) => {
    ProductMaster.find()
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
exports.product_master_get_one = (req, res, next) => {
    id = req.params._id;
    ProductMaster.findById(id)
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
exports.product_master_update = (req, res, next) => {

    const id = req.params._id;  
    // for (const ops in req.body) {
    //     updateOps[ops.propName] = ops.value;
    // }
    ProductMaster.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            ProductMaster.findById(id)
                .then(docs => {
                    //console.log("docs****", docs)
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
exports.product_master_delete = (req, res, next) => {
    const id = req.params._id;
    ProductMaster.remove({ _id: id })
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