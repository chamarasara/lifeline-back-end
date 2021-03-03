const Count = require('../../models/counter/count');
const Salaries = require('../../models/hr/Salaries');
const mongoose = require('mongoose');
const moment = require('moment');
const PDFDocument = require("pdfkit");

//Add new salary
exports.add_new_salary = (req, res, next) => {

    Count.findOneAndUpdate({ id: 'salaryNo' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {
        if (doc) {
            console.log(doc)
            //generate invoice number
            function getReferanceNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                return "SAL" + year.toString() + month.toString() + doc.seq
            }

            const salaries = new Salaries({
                id: mongoose.Types.ObjectId(),
                referanceNumber: getReferanceNumber(),
                employeeId: req.body.employeeId,
                month: req.body.month,
                overTimeHours: req.body.overTimeHours,
                overTimeRate: req.body.overTimeRate,
                loanRecovery: req.body.loanRecovery,
                stampDuty: req.body.stampDuty,
                noPay: req.body.noPay,
                userId: req.body.user.user.userId,
                userName: req.body.user.user.userName,
                userRole: req.body.user.user.userRole
            });
            salaries.save()
                .then(result => {
                    console.log("Result", result)
                })
                .catch(err => console.log(err));
            res.status(200).json({
                //message: 'New Raw Material successfully created.',
                salaries: salaries
            });
        }
    })
}

//Get all salaries
exports.get_all_salaries = (req, res, next) => {
    Salaries.aggregate(
        [
            {
                '$lookup': {
                    from: 'employeemasters',
                    localField: 'employeeId',
                    foreignField: 'id',
                    as: 'employeeDetails'
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
//Get one salary
exports.get_one_salary = (req, res, next) => {
    console.log(req.params.id)
    Salaries.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
                }
            },
            {
                '$lookup': {
                    from: 'employeemasters',
                    localField: 'employeeId',
                    foreignField: 'id',
                    as: 'employeeDetails'
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

//Update salary
exports.update_salary = (req, res, next) => {
    const id = req.params.id;
    console.log("req body", req.body);
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Salaries.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            Salaries.findById(id)
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
//Delete salary
exports.delete_salary = (req, res, next) => {
    const id = req.params._id;
    Salaries.remove({ _id: id })
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
exports.search_salaries = (req, res, next) => {

    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    console.log("startDate", startDate, "endDate", endDate)
    Salaries.aggregate(
        [
            {
                '$lookup': {
                    from: 'employeemasters',
                    localField: 'employeeId',
                    foreignField: 'id',
                    as: 'employeeDetails'
                }
            },
            {
                '$match': {
                    $or: [
                        { "employeeDetails.employeeName": req.body.formValues.searchText },
                        { "employeeDetails.employeeNumber": req.body.formValues.searchText },
                        { "referanceNumber": req.body.formValues.searchText },
                        {
                            date: {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate)
                            }
                        }
                    ]

                }
            }
        ]
    )
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
// Print pay sheet
exports.print_salary = (req, res, next) => {
    Salaries.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
                }
            },
            {
                '$lookup': {
                    from: 'employeemasters',
                    localField: 'employeeId',
                    foreignField: 'id',
                    as: 'employeeDetails'
                }
            }
        ]
    )
        .exec()
        .then(result => {
            const data = result
            if (result) {

                createSalary(result, "./salary.pdf")
                //generate empty pdf
                function createSalary(result, path) {
                    console.log(result)
                    let i;
                    let end;
                    let doc = new PDFDocument({ bufferPages: true });
                    let buffers = [];
                    doc.on('data', buffers.push.bind(buffers));
                    doc.on('end', () => {

                        let pdfData = Buffer.concat(buffers);
                        res.writeHead(200, {
                            'Content-Length': Buffer.byteLength(pdfData),
                            'Content-Type': 'application/pdf;',
                            'Accept': 'application/pdf',
                            'Content-Disposition': 'attachment;filename=salary-sheet.pdf',
                        })
                            .end(pdfData);

                    });
                    // doc.image('logo.jpg', { width: 150, height: 150 })
                    generateHeader(doc)
                    //generateFooter(doc)
                    generateEmployeeInformation(doc, result)
                    generateSalaryTable(doc, result);
                    // see the range of buffered pages
                    const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
                    //set page numbering
                    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                        doc.switchToPage(i);
                        doc.font("Helvetica")
                        doc.fontSize(7)
                        doc.text(`Page ${i + 1} of ${range.count}`, 50,
                            710,
                            { align: "center", width: 500 });
                    }
                    //set userName 
                    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                        doc.switchToPage(i);
                        doc.font("Helvetica")
                        doc.fontSize(8)
                        doc.text(`"This is system generate document. No sign required"`, 50,
                            695,
                            { align: "center", width: 500 });
                    }
                    // manually flush pages that have been buffered
                    doc.flushPages();
                    //doc.pipe(res)
                    //console.log(res)
                    doc.end();

                }
                //generate pdf header
                function generateHeader(doc) {
                    doc
                        .image('controllers/sales/logo.png', 40, 40, { width: 100 })
                        .fillColor("#444444")
                        .fontSize(18)
                        .text("Lifeguard Manufacturing (Pvt) Ltd", 155, 80)
                        .fontSize(10)
                        .text("No:114/1/12,", 200, 65, { align: "right" })
                        .text("Maharagama Road,", 200, 80, { align: "right" })
                        .text("Piliyandala, Sri Lanka", 200, 95, { align: "right" })
                        .text("+94 0112 617 711", 200, 110, { align: "right" })
                        .moveDown();
                }
                //generate pdf footer
                function generateFooter(doc) {
                    doc
                        .fontSize(10)
                        .text(
                            "Payment is due within 15 days. Thank you for your business.",
                            50,
                            685,
                            { align: "center", width: 500 }
                        );
                }
                //generate customer information
                function generateEmployeeInformation(doc, result) {
                    const results = result.map(data => {
                        const employeeName = data.employeeDetails.map(employee => {
                            return employee.employeeName
                        })
                        const employeeNumber = data.employeeDetails.map(employee => {
                            return employee.employeeNumber
                        })
                        const idNumber = data.employeeDetails.map(employee => {
                            return employee.idNumber
                        })
                        const contactNumber = data.employeeDetails.map(employee => {
                            return employee.contactNumber
                        })
                        const designation = data.employeeDetails.map(employee => {
                            return employee.designation
                        })
                        const employeeStatus = data.employeeDetails.map(employee => {
                            return employee.employeeStatus
                        })

                        doc
                            .fillColor("#444444")
                            .fontSize(15)
                            .text("Salary Statement", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`Employee Name: ${employeeName}`, 50, 200)
                            .text(`Designation: ${designation}`, 50, 220)
                            .text(`NIC Number: ${idNumber}`, 50, 240)
                            .text(`Employee Status: ${employeeStatus}`, 50, 260)
                            .font("Helvetica")
                            .text(`Employee Number: ${employeeNumber}`, 390, 200)
                            .text(`Reference Number: ${data.referanceNumber}`, 390, 220)
                            .text(`Month: ${data.month}`, 390, 240)
                            .text(`Created By: ${data.userName}`, 390, 260)
                            .moveDown();

                        generateHr(doc, 285);
                    })

                }
                function generateHr(doc, y) {
                    doc
                        .strokeColor("#aaaaaa")
                        .lineWidth(1)
                        .moveTo(50, y)
                        .lineTo(550, y)
                        .stroke();
                }                                
                function generateLineIncome(doc, y) {
                    doc
                        .strokeColor("#aaaaaa")
                        .lineWidth(1)
                        .moveTo(200, y)
                        .lineTo(250, y)
                        .stroke();
                }
                //generate table row
                function generateTableRowTop(doc, y, c1, c2) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(c1, 50, y, { width: 100 })
                        .text(c2, 150, y, { width: 100, align: "right" })
                }
                function generateTableRowTopRight(doc, y, c1, c2) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(c1, 350, y, { width: 100 })
                        .text(c2, 450, y, { width: 100, align: "right" })
                }
                function generateTableRowBasicSalary(doc, y, c1, c2) {
                    doc
                        .font("Helvetica")
                        .fontSize(9)
                        .text(c1, 50, y, { width: 100 })
                        .text(c2, 150, y, { width: 100, align: "right" })
                }
                function generateTableRowRight(doc, y, c1, c2) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(c1, 350, y, { width: 100 })
                        .text(c2, 450, y, { width: 100, align: "right" })
                }
                function generateTableRow(doc, y, c1, c2) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(c1, 50, y, { width: 200 })
                        .text(c2, 150, y, { width: 100, align: "right" })
                }
                function generateTableRowSubItem(doc, y, c1, c2) {
                    doc
                        .font("Helvetica")
                        .fontSize(9)
                        .text(c1, 70, y, { width: 200 })
                        .text(c2, 150, y, { width: 100, align: "right" })
                }
                function generateTableRowSubItemRight(doc, y, c1, c2) {
                    doc
                        .font("Helvetica")
                        .fontSize(9)
                        .text(c1, 350, y, { width: 200 })
                        .text(c2, 450, y, { width: 100, align: "right" })
                }
                function formatNumber(num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                }

                //generate invoice table
                function generateSalaryTable(doc, result) {
                    console.log("res", result.employeeDetails)
                    const salaryTableTop = 300;
                    generateTableRowTop(
                        doc,
                        salaryTableTop,
                        "Description",
                        "Amount"
                    );
                    let i,
                        invoiceTableTop = 330;
                    const results = result.map(data => {
                        const basicSalary = data.employeeDetails.map(employee => {
                            return employee.basicSalary
                        })

                        generateTableRowBasicSalary(
                            doc,
                            salaryTableTop + 15,
                            "Basic Salary",
                            formatNumber(basicSalary[0].toFixed(2))
                        );

                        generateTableRow(
                            doc,
                            salaryTableTop + 30,
                            "Fixed Allowances"
                        );

                        const vehicleAllowance = data.employeeDetails.map(employee => {
                            return employee.vehicleAllowance
                        })

                        generateTableRowSubItem(
                            doc,
                            salaryTableTop + 45,
                            "Vehicle Allowance",
                            formatNumber(vehicleAllowance[0].toFixed(2))
                        );

                        const fuelAllowance = data.employeeDetails.map(employee => {
                            return employee.fuelAllowance
                        })
                        generateTableRowSubItem(
                            doc,
                            salaryTableTop + 55,
                            "Fuel Allowance",
                            formatNumber(fuelAllowance[0].toFixed(2))
                        );

                        const transportAllowance = data.employeeDetails.map(employee => {
                            return employee.transportAllowance
                        })
                        generateTableRowSubItem(
                            doc,
                            salaryTableTop + 65,
                            "Transport Allowance",
                            formatNumber(transportAllowance[0].toFixed(2))
                        );

                        const telephoneAllowance = data.employeeDetails.map(employee => {
                            return employee.telephoneAllowance
                        })
                        generateTableRowSubItem(
                            doc,
                            salaryTableTop + 75,
                            "Telephone Allowance",
                            formatNumber(telephoneAllowance[0].toFixed(2))
                        );

                        const foodAllowance = data.employeeDetails.map(employee => {
                            return employee.foodAllowance
                        })
                        generateTableRowSubItem(
                            doc,
                            salaryTableTop + 85,
                            "Food Allowance",
                            formatNumber(foodAllowance[0].toFixed(2))
                        );
                       
                        const bonus = data.employeeDetails.map(employee => {
                            return employee.bonus
                        })                        
                        generateTableRow(
                            doc,
                            salaryTableTop + 100,
                            "Variable Allowances"
                        );
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const ot = item.overTimeHours * item.overTimeRate
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItem(
                                doc,
                                salaryTableTop + 115,
                                "OT",
                                formatNumber(ot.toFixed(2))
                            );
                        }
                        generateTableRowSubItem(
                            doc,
                            salaryTableTop + 125,
                            "Bonus",
                            formatNumber(bonus[0].toFixed(2))
                        );
                        generateLineIncome(doc, 435)
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const ot = item.overTimeHours * item.overTimeRate
                            const total = basicSalary[0] + vehicleAllowance[0] + fuelAllowance[0] + transportAllowance[0] + telephoneAllowance[0] + foodAllowance[0] + bonus[0] + ot
                            generateTableRow(
                                doc,
                                salaryTableTop + 140,
                                "Gross Earnings",
                                formatNumber(total.toFixed(2))
                            );
                        }
                        for (i = 0; i < result.length; i++) {
                            generateTableRow(
                                doc,
                                salaryTableTop + 160,
                                "Deductions (-)"
                            );
                        }
                        const epfEmployee = data.employeeDetails.map(employee => {
                            return employee.epfEmployee
                        })
                        for (i = 0; i < result.length; i++) {
                            generateTableRowSubItem(
                                doc,
                                salaryTableTop + 175,
                                "EPF 8% Employee",
                                formatNumber(epfEmployee[0].toFixed(2))
                            );
                        }
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItem(
                                doc,
                                salaryTableTop + 185,
                                "Loan Recovery",
                                formatNumber(item.loanRecovery.toFixed(2))
                            );
                        }
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItem(
                                doc,
                                salaryTableTop + 195,
                                "Stamp Duty",
                                formatNumber(item.stampDuty.toFixed(2))
                            );
                        }
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItem(
                                doc,
                                salaryTableTop + 205,
                                "No Pay",
                                formatNumber(item.noPay.toFixed(2))
                            );
                        }
                        generateLineIncome(doc, 515)
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const total = epfEmployee[0] + item.loanRecovery + item.stampDuty + item.noPay
                            generateTableRow(
                                doc,
                                salaryTableTop + 220,
                                "Total Deductions ",
                                `(${total.toFixed(2)})`
                            );
                        }
                        generateLineIncome(doc, 532)
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const ot = item.overTimeHours * item.overTimeRate
                            const total =( basicSalary[0] + vehicleAllowance[0] + fuelAllowance[0] + transportAllowance[0] + telephoneAllowance[0] + foodAllowance[0] + bonus[0] + ot) -(epfEmployee[0] + item.loanRecovery + item.stampDuty + item.noPay)
                            generateTableRow(
                                doc,
                                salaryTableTop + 236,
                                "Net Earning ",
                                total.toFixed(2)
                            );
                        }
                        generateLineIncome(doc, 547)
                        generateLineIncome(doc, 549)
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowTopRight(
                                doc,
                                salaryTableTop ,
                                "Other Benifits",
                                "Amount"
                            );
                        }                       
                        const insuaranceCost = data.employeeDetails.map(employee => {
                            return employee.insuaranceCost
                        })
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItemRight(
                                doc,
                                salaryTableTop + 15,
                                "Insuarance Allowance",
                                formatNumber(insuaranceCost[0].toFixed(2))
                            );
                        }
                        const uniformCost = data.employeeDetails.map(employee => {
                            return employee.uniformCost
                        })
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItemRight(
                                doc,
                                salaryTableTop + 30,
                                "Uniform Allowance",
                                formatNumber(uniformCost[0].toFixed(2))
                            );
                        }
                        const epfCompany = data.employeeDetails.map(employee => {
                            return employee.epfCompany
                        })
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItemRight(
                                doc,
                                salaryTableTop + 45,
                                "EPF 12% Employer",
                                formatNumber(epfCompany[0].toFixed(2))
                            );
                        }
                        const etfEmployee = data.employeeDetails.map(employee => {
                            return employee.etfEmployee
                        })
                        for (i = 0; i < result.length; i++) {
                            const item = result[i];
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRowSubItemRight(
                                doc,
                                salaryTableTop + 60,
                                "ETF 3% Employer",
                                formatNumber(etfEmployee[0].toFixed(2))
                            );
                        }                        
                    }
                    )
                }
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