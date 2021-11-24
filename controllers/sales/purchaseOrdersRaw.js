const PurchaseOrdersRaw = require('../../models/purchaseOrders/purchaseOrdersRaw');
const Count = require('../../models/counter/count');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');
const PDFDocument = require("pdfkit");

//const Supplier = require('../../models/master/SupplierMaster');
//Add new purchase order
exports.purchase_order_raw_add_new = (req, res, next) => {
    Count.findOneAndUpdate({ id: 'purchaseOrderRmNo' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {
        if (doc) {
            //generate order number
            function getOrderNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                return "POR" + year.toString() + month.toString() + doc.seq
            }
            const purchaseOrdersRaw = new PurchaseOrdersRaw({
                id: mongoose.Types.ObjectId(),
                supplierId: req.body.supplierId,
                userId: req.body.user.userId,
                userName: req.body.user.user.userName,
                userRole: req.body.user.user.userRole,
                rawMaterials: req.body.rawMaterials,
                order_state: "Pending",
                orderNumber: getOrderNumber()
            });
            purchaseOrdersRaw.save()
                .then(result => {
                    console.log("New PO RM ", result)
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    })
                });
            res.status(200).json({
                message: 'Successfull!',
                purchaseOrdersRaw: purchaseOrdersRaw
            });
        }
    })
}

//Get all raw materials
exports.purchase_orders_raw_get_all = (req, res, next) => {
    //PurchaseOrders.find()
    PurchaseOrdersRaw.aggregate(
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
                from: 'rawmaterialmasters',
                localField: 'rawMaterials.id',
                foreignField: 'id',
                as: 'rawMaterialsList'
            }
        }
        ]
    )
        .exec()
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
exports.purchase_orders_raw_get_one = (req, res, next) => {
    console.log("Single PO", req.params.id)
    //PurchaseOrders.findById(req.params._id)
    PurchaseOrdersRaw.aggregate(
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
                    from: 'rawmaterialmasters',
                    let: { materialId: "$rawMaterials.id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", "$$materialId"] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$materialId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'rawMaterialsList'
                }
            },
            {
                '$lookup': {
                    from: 'bankaccountsmasters',
                    let: { bankId: "$bankPaymentsDetails.bank" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", { $cond: { if: { $isArray: "$$bankId" }, then: "$$bankId", else: [] } }] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$bankId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'bankAccounts'
                }
            },
            {
                '$lookup': {
                    from: 'bankaccountsmasters',
                    let: { bankId: "$additionalChargesChequePayments.bank" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", { $cond: { if: { $isArray: "$$bankId" }, then: "$$bankId", else: [] } }] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$bankId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'bankAccountsAdditionalCharges'
                }
            }
        ]
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
exports.update_purchase_order_raw = (req, res, next) => {

    const id = req.params.id;
    const updateOps = {}
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    PurchaseOrdersRaw.updateOne({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            PurchaseOrdersRaw.findById(id)
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
//Update purchase order state
exports.update_purchase_order_state_raw = (req, res, next) => {

    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    PurchaseOrdersRaw.updateOne({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            PurchaseOrdersRaw.findById(id)
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
//Push GRN details to PO
exports.grn_details = (req, res, next) => {
    Count.findOneAndUpdate({ id: 'grnNumberRm' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {

        if (doc) {
            function getGrnNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                return "GRN-RM-" + year.toString() + month.toString() + doc.seq
            }
            const grnId = mongoose.Types.ObjectId()
            const date = new Date()
            const data = req.body.rawMaterials
            const remarks = req.body.remarks
            const invoiceNumber = req.body.invoiceNumber
            const invoiceDate = req.body.invoiceDate
            const additionalCharges = req.body.additionalCharges
            const grnNumber = getGrnNumber()
            PurchaseOrdersRaw.updateOne({ _id: req.params.id }, {
                $push: {
                    grnDetails: { grnId, date, grnNumber, remarks, invoiceNumber, invoiceDate, additionalCharges, data }
                }
            })
                .exec()
                .then(result => {
                    PurchaseOrdersRaw.findById(req.params.id)
                        .then(docs => {
                            res.status(200).json(docs);
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            const materialIdList = []
            const matrialQuantityList = []
            //Update inventory
        }

    })
    //req.setTimeout(2147483647);
    // console.log(" req.body.rawMaterials", req.body.rawMaterials)
    // const id = req.params.id;



}
//Bank cheque payments 
exports.bank_payments_details = (req, res, next) => {
    console.log(req.body)
    const paymentId = mongoose.Types.ObjectId()
    const date = new Date()
    const data = req.body
    const chequeNumber = req.body.chequeNumber
    const chequeDate = req.body.chequeDate
    const amount = req.body.amount
    const bank = req.body.bank
    const remarks = req.body.remarks

    PurchaseOrdersRaw.updateOne({ _id: req.params.id }, {
        $push: {
            bankPaymentsDetails: { paymentId, date, chequeNumber, chequeDate, amount, bank, remarks }
        }
    })
        .exec()
        .then(result => {
            PurchaseOrdersRaw.findById(req.params.id)
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });


}
exports.cash_payments_details = (req, res, next) => {
    console.log(req.body)
    const paymentId = mongoose.Types.ObjectId()
    const date = new Date()
    const amount = req.body.amount
    const remarks = req.body.remarks

    PurchaseOrdersRaw.updateOne({ _id: req.params.id }, {
        $push: {
            cashPaymentsDetails: { paymentId, date, amount, remarks }
        }
    })
        .exec()
        .then(result => {
            PurchaseOrdersRaw.findById(req.params.id)
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}
//Additional charges cheque payments 
exports.additional_charges_bank_payments_details = (req, res, next) => {
    console.log(req.body)
    const paymentId = mongoose.Types.ObjectId()
    const date = new Date()
    const reason = req.body.reason
    const amount = req.body.amount
    const chequeNumber = req.body.chequeNumber
    const chequeDate = req.body.chequeDate
    const bank = req.body.bank
    const remarks = req.body.remarks

    PurchaseOrdersRaw.updateOne({ _id: req.params.id }, {
        $push: {
            additionalChargesChequePayments: { paymentId, date, chequeNumber, chequeDate, bank, reason, amount, remarks }
        }
    })
        .exec()
        .then(result => {
            PurchaseOrdersRaw.findById(req.params.id)
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}
//additional charges cash payments details
exports.additional_charges_cash_payments_details = (req, res, next) => {
    console.log(req.body)
    const paymentId = mongoose.Types.ObjectId()
    const date = new Date()
    const amount = req.body.amount
    const reason = req.body.reason
    const remarks = req.body.remarks

    PurchaseOrdersRaw.updateOne({ _id: req.params.id }, {
        $push: {
            additionalChargesCashPayments: { paymentId, date, amount, reason, remarks }
        }
    })
        .exec()
        .then(result => {
            PurchaseOrdersRaw.findById(req.params.id)
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}
//Push GRN details to PO
exports.returns_details = (req, res, next) => {
    console.log("req.body", req.body.rawMaterials)
    Count.findOneAndUpdate({ id: 'purchaseOrderReturnsRm' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {
        if (doc) {
            function getReturnNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                return "RT-RM-" + year.toString() + month.toString() + doc.seq
            }
            const returnsId = mongoose.Types.ObjectId()
            const date = new Date()
            const data = req.body.rawMaterials
            const remarks = req.body.remarks
            const returnNumber = getReturnNumber()
            PurchaseOrdersRaw.updateOne({ _id: req.params.id }, {
                $push: {
                    returnsDetails: { returnsId, date, returnNumber, remarks, data }
                }
            })
                .exec()
                .then(result => {
                    PurchaseOrdersRaw.findById(req.params.id)
                        .then(docs => {
                            console.log("docs", docs)
                            res.status(200).json(docs);
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            const materialIdList = []
            const matrialQuantityList = []
            //Update inventory
        }

    })
    //req.setTimeout(2147483647);
    // console.log(" req.body.rawMaterials", req.body.rawMaterials)
    // const id = req.params.id;



}
//Delete purchase orders
exports.delete_purchase_order_raw = (req, res, next) => {
    const id = req.params.id;
    PurchaseOrdersRaw.remove({ _id: id })
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
exports.search_purchase_orders_raw = (req, res, next) => {
    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    PurchaseOrdersRaw.aggregate(
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
                    from: 'rawmaterialmasters',
                    localField: 'rawMaterials.id',
                    foreignField: 'id',
                    as: 'searchRawMaterial'
                }
            },
            {
                '$match': {
                    $or: [
                        { "searchRawMaterial.materialName": req.body.formValues.searchText },
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
//Print purchase orders
exports.print_purchase_orders_raw = (req, res, next) => {
    PurchaseOrdersRaw.aggregate(
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
                    from: 'rawmaterialmasters',
                    let: { materialId: "$rawMaterials.id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", "$$materialId"] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$materialId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'rawMaterialsList'
                }
            }
        ]
    )
        .then(result => {
            const data = result
            if (result) {

                createPurchaseOrder(result, "./purchaseorder.pdf")
                //generate empty pdf
                function createPurchaseOrder(result, path) {

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
                            'Content-Disposition': 'attachment;filename=invoice.pdf',
                        })
                            .end(pdfData);


                    });
                    // doc.image('logo.jpg', { width: 150, height: 150 })
                    generateHeader(doc)
                    //generateFooter(doc)
                    generateSupplierInformation(doc, result)
                    generateOrderTable(doc, result);
                    // see the range of buffered pages
                    const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
                    //set page numbering
                    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                        doc.switchToPage(i);
                        doc.fontSize(8)
                        doc.text(`Page ${i + 1} of ${range.count}`, 50,
                            710,
                            { align: "center", width: 500 });
                    }
                    //set userName 
                    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                        doc.switchToPage(i);
                        doc.text(`This is system generated document. No sign required`, 50,
                            700,
                            { align: "center", width: 500 });
                    }
                    // manually flush pages that have been buffered
                    doc.flushPages();
                    //doc.pipe(res)
                    doc.end();

                }
                function formatNumber(num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                }
                //generate pdf header
                function generateHeader(doc) {
                    doc
                        .image('controllers/sales/logo.png', 40, 40, { width: 100 })
                        .fillColor("#444444")
                        .fontSize(18)
                        .text("Lifeguard Manufacturing (Pvt)Ltd.", 155, 80)
                        .fontSize(10)
                        .text("No:114/1/12,", 200, 65, { align: "right" })
                        .text("Maharagama Road,", 200, 80, { align: "right" })
                        .text("Piliyandala, Sri Lanka", 200, 95, { align: "right" })
                        .text("+94 0112 617 711", 200, 110, { align: "right" })
                        .moveDown();
                }

                //generate customer information
                function generateSupplierInformation(doc, result) {
                    const results = result.map(data => {
                        const companyName = data.supplier.map(supplier => {
                            return supplier.companyName
                        })
                        const mobileNo = data.supplier.map(supplier => {
                            return supplier.mobileNo1
                        })
                        const email = data.supplier.map(supplier => {
                            return supplier.email
                        })
                        const creditPeriod = data.supplier.map(supplier => {
                            return supplier.creditPeriod
                        })
                        const address = data.supplier.map(address => {
                            return address.communicationAddress
                        })
                        const no = address.map(no => {
                            return no.no
                        })
                        const lane = address.map(lane => {
                            return lane.lane
                        })
                        const city = address.map(city => {
                            return city.city
                        })
                        const country = address.map(country => {
                            return country.country
                        })
                        const postalCode = address.map(postalCode => {
                            return postalCode.postalCode
                        })
                        doc
                            .fillColor("#444444")
                            .fontSize(15)
                            .text("Purchase Order RM", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`Order Number: ${data.orderNumber}`, 50, 200)
                            .text(`Order Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 215)
                            .text(`Created By: ${data.userName}`, 50, 230)
                            .text(`${companyName}`, 350, 200)
                            .font("Helvetica")
                            .text(`${no},${lane}`, 350, 215)
                            .text(`${city}, ${country}, ${postalCode}`, 350, 230)
                            .text(`${email}`, 350, 245)
                            .text(`${mobileNo}`, 350, 260)
                            .moveDown();

                        generateHr(doc, 277);
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
                //generate table row
                function generateTableRow(doc, y, materialCodeRm, productName, uom, quantity, unitPrice, total) {

                    doc
                        .font("Helvetica")
                        .fontSize(9)
                        .text(materialCodeRm, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 250 })
                        .text(uom, 320, y, { width: 50, align: "right" })
                        .text(quantity, 380, y, { width: 60, align: "right" })
                        .text(unitPrice, 430, y, { width: 60, align: "right" })
                        .text(total, 480, y, { width: 70, align: "right" })
                }
                function generateTableRowBottom(doc, y, total1, total) {

                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(total1, 430, y, { width: 50, align: "right" })
                        .text(total, 480, y, { width: 70, align: "right" })
                }
                function generateTableRowTop(doc, y, productCode, productName, uom, quantity, unitPrice, total) {
                    doc
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 250 })
                        .text(uom, 320, y, { width: 50, align: "right" })
                        .text(quantity, 380, y, { width: 60, align: "right" })
                        .text(unitPrice, 430, y, { width: 60, align: "right" })
                        .text(total, 480, y, { width: 70, align: "right" })
                }
                function generateHrBottom(doc, y) {
                    doc
                        .strokeColor("#aaaaaa")
                        .lineWidth(1)
                        .moveTo(490, y)
                        .lineTo(550, y)
                        .stroke();
                }
                function getSubtotal(result) {
                    const sum = []
                    const subtotal = result.map(data => {

                        const item = data.rawMaterials.map(data => {
                            let totalValue = Number(data.unitPrice) * Number(data.quantity)
                            let total = totalValue
                            return total
                        })

                        for (let i = 0; i < Math.min(item.length); i++) {
                            let total = Number(item[i])
                            sum[i] = total
                        }
                        const totalSum = sum.reduce((a, b) => a + b, 0)
                        return formatNumber(totalSum.toFixed(2))
                    })
                    return subtotal
                }
                //generate invoice table
                function generateOrderTable(doc, result) {

                    const productTable = result.map(data => {

                        let i,
                            orderTableTop = 290;
                        const products = data.rawMaterialsList.map(data => {
                            return data
                        })

                        const quantities = data.rawMaterials.map(data => {
                            return data
                        })
                        doc.font("Helvetica")
                        generateTableRowTop(
                            doc,
                            orderTableTop,
                            "Code",
                            "Material Name",
                            "UOM",
                            "Quantity",
                            "Unit Price",
                            "Total"
                        );
                        generateHr(doc, orderTableTop + 20);
                        doc.font("Helvetica")
                        for (i = 0; i < products.length; i++) {
                            for (let index = 0; index < quantities.length; index++) {
                                const product = products[i];
                                const quantity = quantities[i]
                                const position = orderTableTop + (i + 1) * 30;
                                const subtotal = Number(quantity.quantity) * Number(quantity.unitPrice)
                                generateTableRow(
                                    doc,
                                    position,
                                    `RM${product.materialCodeRm}`,
                                    product.materialName,
                                    quantity.uom,
                                    quantity.quantity,
                                    formatNumber(Number(quantity.unitPrice).toFixed(2)),
                                    formatNumber(Number(subtotal).toFixed(2))
                                );
                                generateHr(doc, position + 20);
                            }
                        }

                        const subtotalPosition = orderTableTop + (i + 1) * 30;
                        generateTableRowBottom(
                            doc,
                            subtotalPosition,
                            "Subtotal",
                            getSubtotal(result)

                        );
                        generateHrBottom(doc, subtotalPosition + 15);
                        generateHrBottom(doc, subtotalPosition + 17);
                    })
                }
            } else {
                res.status(404).json({ message: "No valid ID found" })
            }

        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}

exports.print_purchase_orders_raw_grn = (req, res, next) => {
    PurchaseOrdersRaw.aggregate(
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
                    from: 'rawmaterialmasters',
                    let: { materialId: "$rawMaterials.id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", "$$materialId"] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$materialId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'rawMaterialsList'
                }
            }
        ]
    )
        .then(result => {
            const data = result
            if (result) {

                createPurchaseOrderGrn(result, "./rawmaterialgrn.pdf")
                //generate empty pdf
                function createPurchaseOrderGrn(result, path) {

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
                            'Content-Disposition': 'attachment;filename=invoice.pdf',
                        })
                            .end(pdfData);


                    });
                    // doc.image('logo.jpg', { width: 150, height: 150 })
                    generateHeader(doc)
                    //generateFooter(doc)
                    generateSupplierInformation(doc, result)
                    generateOrderTable(doc, result);
                    // see the range of buffered pages
                    const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
                    //set page numbering
                    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                        doc.switchToPage(i);
                        doc.fontSize(8)
                        doc.text(`Page ${i + 1} of ${range.count}`, 50,
                            710,
                            { align: "center", width: 500 });
                    }
                    //set userName 
                    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                        doc.switchToPage(i);
                        doc.text(`This is system generated document. No sign required`, 50,
                            700,
                            { align: "center", width: 500 });
                    }
                    // manually flush pages that have been buffered
                    doc.flushPages();
                    //doc.pipe(res)
                    doc.end();

                }
                function formatNumber(num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                }
                //generate pdf header
                function generateHeader(doc) {
                    doc
                        .image('controllers/sales/logo.png', 40, 40, { width: 100 })
                        .fillColor("#444444")
                        .fontSize(18)
                        .text("Lifeguard Manufacturing (Pvt)Ltd.", 155, 80)
                        .fontSize(10)
                        .text("No:114/1/12,", 200, 65, { align: "right" })
                        .text("Maharagama Road,", 200, 80, { align: "right" })
                        .text("Piliyandala, Sri Lanka", 200, 95, { align: "right" })
                        .text("+94 0112 617 711", 200, 110, { align: "right" })
                        .moveDown();
                }

                //generate customer information
                function generateSupplierInformation(doc, result) {
                    const results = result.map(data => {
                        const companyName = data.supplier.map(supplier => {
                            return supplier.companyName
                        })
                        const mobileNo = data.supplier.map(supplier => {
                            return supplier.mobileNo1
                        })
                        const email = data.supplier.map(supplier => {
                            return supplier.email
                        })
                        const creditPeriod = data.supplier.map(supplier => {
                            return supplier.creditPeriod
                        })
                        const address = data.supplier.map(address => {
                            return address.communicationAddress
                        })
                        const no = address.map(no => {
                            return no.no
                        })
                        const lane = address.map(lane => {
                            return lane.lane
                        })
                        const city = address.map(city => {
                            return city.city
                        })
                        const country = address.map(country => {
                            return country.country
                        })
                        const postalCode = address.map(postalCode => {
                            return postalCode.postalCode
                        })
                        doc
                            .fillColor("#444444")
                            .fontSize(15)
                            .text("Purchase Order RM", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`Order Number: ${data.orderNumber}`, 50, 200)
                            .text(`Order Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 215)
                            .text(`Created By: ${data.userName}`, 50, 230)
                            .text(`${companyName}`, 350, 200)
                            .font("Helvetica")
                            .text(`${no},${lane}`, 350, 215)
                            .text(`${city}, ${country}, ${postalCode}`, 350, 230)
                            .text(`${email}`, 350, 245)
                            .text(`${mobileNo}`, 350, 260)
                            .moveDown();

                        generateHr(doc, 277);
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
                //generate table row
                function generateTableRow(doc, y, materialCodeRm, productName, uom, quantity, unitPrice, total) {

                    doc
                        .font("Helvetica")
                        .fontSize(9)
                        .text(materialCodeRm, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 250 })
                        .text(uom, 320, y, { width: 50, align: "right" })
                        .text(quantity, 380, y, { width: 60, align: "right" })
                        .text(unitPrice, 430, y, { width: 60, align: "right" })
                        .text(total, 480, y, { width: 70, align: "right" })
                }
                function generateTableRowBottom(doc, y, total1, total) {

                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(total1, 430, y, { width: 50, align: "right" })
                        .text(total, 480, y, { width: 70, align: "right" })
                }
                function generateTableRowTop(doc, y, productCode, productName, uom, quantity, unitPrice, total) {
                    doc
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 250 })
                        .text(uom, 320, y, { width: 50, align: "right" })
                        .text(quantity, 380, y, { width: 60, align: "right" })
                        .text(unitPrice, 430, y, { width: 60, align: "right" })
                        .text(total, 480, y, { width: 70, align: "right" })
                }
                function generateHrBottom(doc, y) {
                    doc
                        .strokeColor("#aaaaaa")
                        .lineWidth(1)
                        .moveTo(490, y)
                        .lineTo(550, y)
                        .stroke();
                }
                function getSubtotal(result) {
                    const sum = []
                    const subtotal = result.map(data => {

                        const item = data.rawMaterials.map(data => {
                            let totalValue = Number(data.unitPrice) * Number(data.quantity)
                            let total = totalValue
                            return total
                        })

                        for (let i = 0; i < Math.min(item.length); i++) {
                            let total = Number(item[i])
                            sum[i] = total
                        }
                        const totalSum = sum.reduce((a, b) => a + b, 0)
                        return formatNumber(totalSum.toFixed(2))
                    })
                    return subtotal
                }
                //generate invoice table
                function generateOrderTable(doc, result) {

                    const productTable = result.map(data => {

                        let i,
                            orderTableTop = 290;
                        const materials = data.rawMaterialsList.map(data => {
                            return data
                        })
                        const allGrns = data.grnDetails
                        const singleGrn = allGrns.filter(grn => grn.grnId == req.params.grnId)
                        const singleData = singleGrn.map(data => {
                            return data.data
                        })
                        const singleData2 = singleData[0].map(data => {
                            // console.log("data2", data)
                            return data
                        })
                        // console.log("singleData2",singleData2)

                        doc.font("Helvetica")
                        generateTableRowTop(
                            doc,
                            orderTableTop,
                            "Code",
                            "Material Name",
                            "UOM",
                            "Quantity",
                            "Unit Price",
                            "Total"
                        );
                        generateHr(doc, orderTableTop + 20);
                        doc.font("Helvetica")

                        for (i = 0; i < materials.length; i++) {
                            console.log(singleData2.length)
                            for (let index = 0; index < singleData2.length; index++) {
                                const material = materials[i];
                                console.log("Material", materials[i])
                                const grn = singleData2[i]
                                console.log("GRN Data", singleData2[i])
                                const position = orderTableTop + (i + 1) * 30;
                                const subtotal = Number(grn.quantity) * Number(grn.unitPrice)
                                // console.log("subtotal", subtotal)
                                generateTableRow(
                                    doc,
                                    position,
                                    `RM${product.materialCodeRm}`,
                                    product.materialName,
                                    grn.uom,
                                    grn.quantity,
                                    formatNumber(Number(grn.unitPrice).toFixed(2)),
                                    formatNumber(Number(subtotal).toFixed(2))
                                );
                                generateHr(doc, position + 20);
                            }
                        }

                        const subtotalPosition = orderTableTop + (i + 1) * 30;
                        generateTableRowBottom(
                            doc,
                            subtotalPosition,
                            "Subtotal",
                            getSubtotal(result)

                        );
                        generateHrBottom(doc, subtotalPosition + 15);
                        generateHrBottom(doc, subtotalPosition + 17);
                    })
                }
            } else {
                res.status(404).json({ message: "No valid ID found" })
            }

        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}