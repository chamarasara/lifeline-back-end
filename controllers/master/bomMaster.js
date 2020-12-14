const BomMaster = require('../../models/master/BomMaster');
const mongoose = require('mongoose');

//Add new bom
exports.add_new_bom = (req, res, next) => {
    console.log(req.body)
    const bomMaster = new BomMaster({
        id: mongoose.Types.ObjectId(),
        bomName: req.body.bomName,
        rawMaterials: req.body.rawMaterials,
        packingMaterials: req.body.packingMaterials,
        userId: req.body.user.user.userId,
        userName: req.body.user.user.userName,
        userRole: req.body.user.user.userRole
    });
    bomMaster.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        bomMaster: bomMaster
    });
}
//Get all bom
exports.bom_get_all = (req, res, next) => {
    BomMaster.aggregate(
        [
            {
                '$lookup': {
                    from: 'rawmaterialmasters',
                    localField: 'rawMaterials.id',
                    foreignField: 'id',
                    as: 'rawMaterialList'
                }
            },
            {
                '$lookup': {
                    from: 'packingmaterialmasters',
                    localField: 'packingMaterials.id',
                    foreignField: 'id',
                    as: 'packingMaterialList'
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'bomName',
                    foreignField: 'id',
                    as: 'product'
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
//Get one bom
exports.get_one_bom = (req, res, next) => {
    BomMaster.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
                }
            },
            {
                '$lookup': {
                    from: 'rawmaterialmasters',
                    localField: 'rawMaterials.id',
                    foreignField: 'id',
                    as: 'rawMaterialList'
                }
            },
            {
                '$lookup': {
                    from: 'packingmaterialmasters',
                    localField: 'packingMaterials.id',
                    foreignField: 'id',
                    as: 'packingMaterialList'
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'bomName',
                    foreignField: 'id',
                    as: 'product'
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

//Update bom
exports.update_bom = (req, res, next) => {
    const id = req.params.id;
    console.log("req body", req.body);
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }
    BomMaster.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            BomMaster.findById(id)
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
//Delete bom
exports.delete_bom = (req, res, next) => {
    const id = req.params._id;
    BomMaster.remove({ _id: id })
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