const FinishGoodMaster = require('../../models/master/FinishGoodsMaster');
const mongoose = require('mongoose');
//Add new packing material 
exports.finish_good_add_new = (req, res, next) => {
    console.log(req.body)
    function getMaterialCode() {
        for (var i = 0; i < 5; i++)
            var date = new Date()
        //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
        return "RM" + (Math.random() * 10000).toFixed()
    }
    const finishGoodMaster = new FinishGoodMaster({
        id: mongoose.Types.ObjectId(),
        productName: req.body.productName,
        productCategory: req.body.productCategory,
        baseUnitMeasure: req.body.baseUnitMeasure,
        division: req.body.division,
        productState: req.body.productState,
        barCode: req.body.barCode,
        barCodeImage: req.body.barCodeImage,
        productDescription: req.body.productDescription,
        sellingPrice: req.body.sellingPrice,
        userId: req.body.user.user.userId,
        userName: req.body.user.user.userName,
        userRole: req.body.user.user.userRole,
    });
    finishGoodMaster.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        finishGoodMaster: finishGoodMaster
    });
}
//Get all raw materials
exports.finish_good_get_all = (req, res, next) => {
    FinishGoodMaster.find()
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
exports.finish_good_get_one = (req, res, next) => {
    id = req.params._id;
    FinishGoodMaster.findById(id)
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
exports.update_finish_good = (req, res, next) => {

    const id = req.params._id;
    console.log("req body", req.body);
    const updateOps = {};
    // for (const ops in req.body) {
    //     updateOps[ops.propName] = ops.value;
    // }
    FinishGoodMaster.updateOne({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            FinishGoodMaster.findById(id)
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
exports.delete_finish_good = (req, res, next) => {
    const id = req.params._id;
    FinishGoodMaster.remove({ _id: id })
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