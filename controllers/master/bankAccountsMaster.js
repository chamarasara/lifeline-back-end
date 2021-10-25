const BankAccountsMaster = require('../../models/master/BankAccountsMaster');
const mongoose = require('mongoose');

//Add new bank account
exports.new_bank_account = (req, res, next) => {
    const bankAccountsMaster = new BankAccountsMaster({
        id: mongoose.Types.ObjectId(),
        bankName: req.body.bankName,
        accountName: req.body.accountName,
        accountNumber: req.body.accountNumber,
        branch: req.body.branch,
        accountType: req.body.accountType,
        currency: req.body.currency,
        accountStatus: req.body.accountStatus,
        profitCenter: req.body.profitCenter,
        userId: req.body.user.user.userId,
        userName: req.body.user.user.userName,
        userRole: req.body.user.user.userRole
    });
    bankAccountsMaster.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        bankAccountsMaster: bankAccountsMaster
    });
}
//Get all bom
exports.get_all_bank_accounts = (req, res, next) => {
    BankAccountsMaster.find()
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
//Get one account
exports.get_single_bank_account = (req, res, next) => {
    console.log(req.params.id)
    BankAccountsMaster.findById(req.params.id)
        .exec()
        .then(doc => {
            if (doc) {           
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: "No valid account found" })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

//Update bom
exports.update_bank_account = (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }
    BankAccountsMaster.updateOne({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            BankAccountsMaster.findById(id)
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
//Delete bank account
exports.delete_bank_account = (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }
    BankAccountsMaster.updateOne({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            BankAccountsMaster.findById(id)
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