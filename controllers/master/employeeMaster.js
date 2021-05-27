const Count = require('../../models/counter/count');
const EmployeeMaster = require('../../models/master/EmployeeMaster');
const mongoose = require('mongoose');
const moment = require('moment');

//Add new employee
exports.add_new_employee = (req, res, next) => {

    Count.findOneAndUpdate({ id: 'employeeNo' }, { $inc: { seq: 0001 } }, { "new": true }, (error, doc) => {
        if (doc) {
            console.log(doc)
            //generate invoice number
            function getEmployeeNumber() {

                if (req.body.companyName == "Lifeguard Manufacturing (Pvt) Ltd") {
                    for (var i = 0; i < 5; i++)
                        var date = new Date()
                    const year = date.getFullYear()
                    const month = date.getMonth() + 1
                    return "ELG" + "000" + doc.seq
                } else if (req.body.companyName == "Lifeline Software Solutions (Pvt) Ltd") {
                    for (var i = 0; i < 5; i++)
                        var date = new Date()
                    const year = date.getFullYear()
                    const month = date.getMonth() + 1
                    return "ELL" + "000" + doc.seq
                } else if (req.body.companyName == "Consultancy") {
                    for (var i = 0; i < 5; i++)
                        var date = new Date()
                    const year = date.getFullYear()
                    const month = date.getMonth() + 1
                    return "ECO" + "000" + doc.seq
                }
            }
            function getDateOfConfirmation() {
                const joinedDate = req.body.joinedDate;
                const probationPeriod = req.body.probationPeriod
                const dateOfConfirmation = moment(joinedDate).add(probationPeriod, 'months')
                return dateOfConfirmation
            }
            const employeeMaster = new EmployeeMaster({
                id: mongoose.Types.ObjectId(),
                employeeNumber: getEmployeeNumber(),
                status: req.body.status,
                employeeName: req.body.employeeName,
                idNumber: req.body.idNumber,
                birthDay: req.body.birthDay,
                contactNumber: req.body.contactNumber,
                guardianNumber: req.body.guardianNumber,
                email: req.body.email,
                otherIdNumber: req.body.otherIdNumber,
                permenantAddress: req.body.permenantAddress,
                temporaryAddress: req.body.temporaryAddress,
                companyName: req.body.companyName,
                designation: req.body.designation,
                joinedDate: req.body.joinedDate,
                probationPeriod: req.body.probationPeriod,
                dateOfConfirmation: getDateOfConfirmation(),
                employeeStatus: req.body.employeeStatus,
                epfNumber: req.body.epfNumber,
                etfNumber: req.body.etfNumber,
                epfCompany: req.body.epfCompany,
                epfEmployee: req.body.epfEmployee,
                etfEmployee: req.body.etfEmployee,
                insuarancePolicyNumber: req.body.insuarancePolicyNumber,
                overTimeRate: req.body.overTimeRate,
                userId: req.body.user.user.userId,
                userName: req.body.user.user.userName,
                userRole: req.body.user.user.userRole
            });
            employeeMaster.save()
                .then(result => {
                    console.log("Result", result)
                })
                .catch(err => console.log(err));
            res.status(200).json({
                //message: 'New Raw Material successfully created.',
                employeeMaster: employeeMaster
            });
        }
    })
}

//Get all employees
exports.get_all_employees = (req, res, next) => {
    EmployeeMaster.find()
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
//Get one employee
exports.get_one_employee = (req, res, next) => {
    console.log(req.params.id)
    EmployeeMaster.findById(req.params.id)
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

//Update employee
exports.update_employee = (req, res, next) => {
    const id = req.params.id;
    console.log("req body", req.body);
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }
    EmployeeMaster.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            EmployeeMaster.findById(id)
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
//Delete employee
exports.delete_employee = (req, res, next) => {
    const id = req.params._id;
    console.log("Delete params", id)
    EmployeeMaster.remove({ _id: id })
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