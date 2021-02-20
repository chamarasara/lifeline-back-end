const Count = require('../../models/counter/count');
const DistributorMaster = require('../../models/master/DistributorMaster');
const mongoose = require('mongoose');
const moment = require('moment');

//Add new distributor
exports.add_new_distributor = (req, res, next) => {
    
    Count.findOneAndUpdate({ id: 'distributorNo' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {
        console.log(doc)
        console.log("Distributor", doc)
        if (doc) {
            console.log(doc)
            //generate invoice number
            function getDistributorNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                console.log("DIS" + year.toString() + month.toString() + doc.seq)
                //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
                return "DIS" + year.toString() + month.toString() + doc.seq
            }

            const distributorMaster = new DistributorMaster({
                id: mongoose.Types.ObjectId(),
                companyName: req.body.companyName,
                distributorName: req.body.distributorName,
                mobileNo1: req.body.mobileNo1,
                mobileNo2: req.body.mobileNo2,
                fax: req.body.fax,
                registerNo: req.body.registerNo,
                email: req.body.email,
                fax: req.body.fax,
                state: req.body.state,
                currency: req.body.currency,
                creditPeriod: req.body.creditPeriod,
                creditAmount: req.body.creditAmount,
                distributorCode: getDistributorNumber(),
                communicationAddress: {
                    city: req.body.communicationAddress.city,
                    country: req.body.communicationAddress.country,
                    lane: req.body.communicationAddress.lane,
                    no: req.body.communicationAddress.no,
                    postalCode: req.body.communicationAddress.postalCode,
                },
                products: req.body.products,
                userId: req.body.user.user.userId,
                userName: req.body.user.user.userName,
                userRole: req.body.user.user.userRole
            });
            distributorMaster.save()
                .then(result => {
                    console.log("Result",result)
                })
                .catch(err => console.log(err));
            res.status(200).json({
                //message: 'New Raw Material successfully created.',
                distributorMaster: distributorMaster
            });
        }
    })
}

//Get all bom
exports.distributor_get_all = (req, res, next) => {
    DistributorMaster.aggregate(
        [

            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'productsList'
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
//Get one distributor
exports.get_one_distributor = (req, res, next) => {
    console.log(req.params.id)
    DistributorMaster.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'productsList'
                }
            }
        ]
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

//Update distributor
exports.update_distributor = (req, res, next) => {
    const id = req.params.id;
    console.log("req body", req.body);
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }
    DistributorMaster.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            DistributorMaster.findById(id)
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
//Delete distributor
exports.delete_distributor = (req, res, next) => {
    const id = req.params._id;
    DistributorMaster.remove({ _id: id })
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