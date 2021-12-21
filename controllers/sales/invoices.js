const Invoices = require('../../models/invoices/invoices');
const FinishGoodInventory = require("../../models/inventory/FinishGoodInventory");
const Count = require('../../models/counter/count');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require("fs");
const PDFDocument = require("pdfkit");
const Finishgoodsmasters = require('../../models/master/FinishGoodsMaster');

//Add new purchase order
exports.add_new_invoice = (req, res, next) => {
    console.log(req.body)
    Count.findOneAndUpdate({ id: 'invoiceNo' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {

        if (doc) {
            //generate invoice number
            function getInvoiceNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                //console.log("IN" + year.toString() + month.toString() + doc.seq)
                //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
                return "IN" + year.toString() + month.toString() + doc.seq
            }

            const productList = [];

            for (let i = 0; i < req.body.products.length; i++) {
                productList.push(mongoose.Types.ObjectId(req.body.products[i].id));

            }

            Finishgoodsmasters.find({
                'id': {
                    $in: productList
                }
            }, function (err, docs) {
                this.productList = docs;

                var reorderedResults = naturalOrderResults(docs, productList);

                //Re order results by matching products id
                function naturalOrderResults(resultsFromMongoDB, queryIds) {
                    //Let's build the hashmap
                    var hashOfResults = resultsFromMongoDB.reduce(function (prev, curr) {
                        prev[curr.id] = curr;
                        return prev;
                    }, {});

                    return queryIds.map(function (id) { return hashOfResults[id] });
                }

                for (let i = 0; i < req.body.products.length; i++) {
                    req.body.products[i].sellingPrice = reorderedResults[i].sellingPrice;
                }


                const invoices = new Invoices({
                    id: mongoose.Types.ObjectId(),
                    customerId: req.body.customerId,
                    quotationNumber: req.body.quotationNumber,
                    remarks: req.body.remarks,
                    reference: req.body.reference,
                    additionalCharges: req.body.additionalCharges,
                    userId: req.body.user.user.userId,
                    userName: req.body.user.user.userName,
                    userRole: req.body.user.user.userRole,
                    invoice_state: "enabled",
                    products: req.body.products,
                    haveReturns: "false",
                    invoiceNumber: getInvoiceNumber()
                });

                //console.log("invoices*****", invoices);

                invoices.save()
                    .then(invoicesRes => {
                        console.log("invoicesRes", invoicesRes)
                        res.status(200).json(invoicesRes);
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        })
                    });

            });
        }
    })
}

//Get all invoices
exports.all_invoices = (req, res, next) => {
    Invoices.aggregate(
        [
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    let: { productId: "$products.id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", "$$productId"] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$productId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'productsDetails'
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
                    from: 'quotations',
                    localField: 'quotationNumber',
                    foreignField: 'id',
                    as: 'quotation'
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
                    from: 'finishgoodsmasters',
                    let: { productId: "$products.id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", "$$productId"] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$productId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'productsDetails'
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
                    from: 'customermasters',
                    localField: 'customerId',
                    foreignField: 'id',
                    as: 'customer'
                }
            },
            {
                '$lookup': {
                    from: 'quotations',
                    localField: 'quotationNumber',
                    foreignField: 'id',
                    as: 'quotation'
                }
            },
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

//Update  invoice
exports.update_invoice = (req, res, next) => {
    const id = req.params.id;
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
                    //console.log(err)
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            //console.log(err)
            res.status(500).json({
                error: err
            });
        });
}
//Bank cheque payments 
exports.bank_payments_details = (req, res, next) => {
    console.log("Invoice payment body", req.body)
    const paymentId = mongoose.Types.ObjectId()
    const date = new Date()
    const data = req.body
    const chequeNumber = req.body.chequeNumber
    const chequeDate = req.body.chequeDate
    const amount = req.body.amount
    const bank = req.body.bank
    const remarks = req.body.remarks

    Invoices.updateOne({ _id: req.params.id }, {
        $push: {
            bankPaymentsDetails: { paymentId, date, chequeNumber, chequeDate, amount, bank, remarks }
        }
    })
        .exec()
        .then(result => {
            Invoices.findById(req.params.id)
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

    Invoices.updateOne({ _id: req.params.id }, {
        $push: {
            cashPaymentsDetails: { paymentId, date, amount, remarks }
        }
    })
        .exec()
        .then(result => {
            Invoices.findById(req.params.id)
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
//push dispatch notes to invoice
exports.dispatch_note = (req, res, next) => {
    req.setTimeout(2147483647);
    const id = req.params.id;
    console.log("Dispatch Note", req.body.remarks)
    const dispatchId = mongoose.Types.ObjectId()
    const remarks = req.body.remarks
    const arr = []
    const date = new Date()
    console.log(date)
    arr.push(req.body.products)
    //console.log(req.body)

    const data = req.body.products
    Invoices.updateOne({ _id: req.params.id }, {
        $push: {
            dispatchNotes: { dispatchId, date, remarks, data }
        }
    })
        .exec()
        .then(result => {
            Invoices.findById(id)
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {
                    //console.log(err)
                    res.status(500).json({
                        error: err
                    });
                });
        })
        .catch(err => {
            //console.log(err)
            res.status(500).json({
                error: err
            });
        });

    //update inventory
    const productIdList = []
    const productQuantityList = []

    for (let i = 0; i < req.body.products.length; i++) {
        productIdList.push(mongoose.Types.ObjectId(req.body.products[i].id));
        console.log("id ", req.body.products[i].id)
    }

    for (let i = 0; i < req.body.products.length; i++) {
        productQuantityList.push(parseInt(req.body.products[i].quantity));
        console.log("quantity ", req.body.products[i].quantity)
    }

    for (let i = 0; i < req.body.products.length; i++) {
        console.log("req.body.products.length ", req.body.products.length)

        FinishGoodInventory.find(
            {
                'productId': req.body.products[i].id,
                'remainingQuantity': { $gt: 0 },
                'finishGoodState': "Active"
            },
            (function (err, docs) {

                for (let x = 0; x < docs.length; x++) {
                    // console.log("productQuantityList[j]", productQuantityList[j])
                    // console.log("docs[x].remainingQuantity", docs[x].remainingQuantity)

                    if (req.body.products[i].id == docs[x].productId && req.body.products[i].quantity == docs[x].remainingQuantity) {
                        console.log(req.body.products[i].quantity, "=====", docs[x].remainingQuantity)
                        let setValue = 0
                        FinishGoodInventory.findOneAndUpdate(
                            { 'id': docs[x].id },
                            {
                                $set: { "remainingQuantity": setValue },
                                $push: { "issuedItems": { "Date": Date(), "invoiceId": req.body.id, "invoiceNumber": req.body.invoiceNumber, quantity: req.body.products[i].quantity } }
                            },
                        )
                            .exec()
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            });
                        console.log("Set value", setValue)
                        { break }
                    }
                    if (req.body.products[i].id == docs[x].productId && req.body.products[i].quantity < docs[x].remainingQuantity) {
                        console.log(req.body.products[i].quantity, "<<<<<", docs[x].remainingQuantity)
                        let setValue = docs[x].remainingQuantity - req.body.products[i].quantity
                        FinishGoodInventory.findOneAndUpdate(
                            { 'id': docs[x].id },
                            {
                                $set: { "remainingQuantity": setValue },
                                $push: { "issuedItems": { "Date": Date(), "invoiceId": req.body.id, "invoiceNumber": req.body.invoiceNumber, quantity: req.body.products[i].quantity } }
                            }
                        ).exec()
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            });
                        { break }
                    }
                    if (req.body.products[i].id == docs[x].productId && req.body.products[i].quantity > docs[x].remainingQuantity) {
                        console.log(req.body.products[i].quantity, ">>>>>", docs[x].remainingQuantity)
                        req.body.products[i].quantity = req.body.products[i].quantity - docs[x].remainingQuantity
                        let setValue = 0
                        FinishGoodInventory.findOneAndUpdate(
                            { 'id': docs[x].id },
                            {
                                $set: { "remainingQuantity": setValue },
                                $push: {
                                    "issuedItems": { "Date": Date(), "invoiceId": req.body.id, "invoiceNumber": req.body.invoiceNumber, quantity: docs[x].remainingQuantity }
                                }
                            }
                        )
                            .exec()
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            });
                    }

                }
            })
        )
    }
}
//Delete invoice
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
    const searchText = req.body.formValues.searchText
    Invoices.aggregate(
        [{
            '$lookup': {
                from: 'finishgoodsmasters',
                let: { productId: "$products.id" },
                pipeline: [
                    {
                        $match: {
                            "$expr": { "$in": ["$id", "$$productId"] }
                        }
                    },
                    {
                        "$addFields": {
                            "sort": {
                                "$indexOfArray": ["$$productId", "$id"]
                            }
                        }
                    },
                    { "$sort": { "sort": 1 } },
                    { "$addFields": { "sort": "$$REMOVE" } }
                ],
                as: 'searchProducts'
            }
        },
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
                from: 'quotations',
                localField: 'quotationNumber',
                foreignField: 'id',
                as: 'quotation'
            }
        },
        {
            '$match': {
                $or: [
                    { "searchProducts.productName": req.body.formValues.searchText },
                    { "searchCustomer.companyName": req.body.formValues.searchText },
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


// Print Invoice
exports.print_invoice = (req, res, next) => {
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
                    from: 'quotations',
                    localField: 'quotationNumber',
                    foreignField: 'id',
                    as: 'quotation'
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    let: { productId: "$products.id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", "$$productId"] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$productId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'productsList'
                }
            }]
    )
        .exec()
        .then(result => {
            const data = result
            if (result) {

                createInvoice(result, "./invoice.pdf")
                //generate empty pdf
                function createInvoice(result, path) {
                    console.log(result.products)
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
                    generateCustomerInformation(doc, result)
                    generateInvoiceTable(doc, result);
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
                        doc.text(`Cheques to be written in favour of "Lifeguard Manufacturing (Pvt) Ltd"`, 50,
                            680,
                            { align: "center", width: 500 });
                        doc.text(`This is a system generated document. No sign required"`, 50,
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
                function generateCustomerInformation(doc, result) {
                    const results = result.map(data => {
                        const companyName = data.customer.map(customer => {
                            return customer.companyName
                        })
                        const mobileNo1 = data.customer.map(customer => {
                            return customer.mobileNo1
                        })
                        const email = data.customer.map(customer => {
                            return customer.email
                        })
                        const address = data.customer.map(address => {
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
                        const quotationNumber = data.quotation.map(quotation => {
                            return quotation.quotationNumber
                        })
                        const creditPeriod = data.customer.map(creditPeriod => {
                            //console.log("credit period", creditPeriod.creditPeriod)
                            return creditPeriod.creditPeriod
                        })
                        doc
                            .fillColor("#444444")
                            .fontSize(15)
                            .text("Invoice", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`Invoice Number: ${data.invoiceNumber}`, 50, 200)
                            .text(`Quotation Number: ${quotationNumber}`, 50, 215)
                            .text(`Invoice Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 230)
                            .text(`Due Date: ${moment(data.date).add('d', creditPeriod).format('DD/MM/YYYY')}`, 50, 245)
                            .text(`Credit Period: ${creditPeriod} days`, 50, 260)
                            .text(`Your Reference: ${data.reference}`, 50, 275)
                            .text(`${companyName}`, 350, 200)
                            .font("Helvetica")
                            .text(`${no},${lane}`, 350, 215)
                            .text(`${city}, ${country}, ${postalCode}`, 350, 230)
                            .text(`${email}`, 350, 245)
                            .text(`${mobileNo1}`, 350, 260)
                            .moveDown();

                        generateHr(doc, 295);
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
                function generateHrBottom(doc, y) {
                    doc
                        .strokeColor("#aaaaaa")
                        .lineWidth(1)
                        .moveTo(490, y)
                        .lineTo(550, y)
                        .stroke();
                }
                //generate table row
                function generateTableRow(doc, y, productCode, productName, uom, quantity, rate, discount, discountAmount, total) {
                    doc
                        .font("Courier-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(quantity, 250, y, { width: 60, align: "right" })
                        .text(rate, 300, y, { width: 60, align: "right" })
                        .text(discount, 350, y, { width: 50, align: "right" })
                        .text(discountAmount, 400, y, { width: 70, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function generateTableBottom(doc, y, productCode, productName, uom, quantity, rate, discount, discountAmount, total) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(quantity, 250, y, { width: 60, align: "right" })
                        .text(rate, 300, y, { width: 60, align: "right" })
                        .text(discount, 350, y, { width: 50, align: "right" })
                        .text(discountAmount, 400, y, { width: 70, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function generateAdditionalCharges(doc, y, reason, amount) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(reason, 400, y, { width: 70, align: "right" })
                        .text(amount, 0, y, { align: "right" });
                }
                function generateTableRowTop(doc, y, productCode, productName, quantity, rate, discount, discountAmount, total) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(quantity, 250, y, { width: 60, align: "right" })
                        .text(rate, 300, y, { width: 60, align: "right" })
                        .text(discount, 350, y, { width: 50, align: "right" })
                        .text(discountAmount, 400, y, { width: 70, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function formatNumber(num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                }
                function getSubTotal(result) {
                    console.log(result)
                    const getTotal = result.map(data => {
                        const quantities = data.products.map(data => {
                            //console.log("quantity", data.quantity)
                            return data.quantity
                        })
                        const discounts = data.products.map(data => {
                            //console.log("discount", data.discount)
                            return data.discount
                        })
                        const rates = data.products.map(data => {
                            //console.log("rate", data.sellingPrice)
                            return data.sellingPrice
                        })
                        let totalValue = []
                        for (let i = 0; i < Math.min(quantities.length); i++) {
                            let quantity = quantities[i]
                            let discount = discounts[i]
                            let rate = rates[i]
                            totalValue[i] = (quantity * rate) / 100 * (100 - discount);

                            //console.log(totalValue, "Total Value")
                        }

                        const total = totalValue.reduce((a, b) => (a + b))
                        //console.log(totalValue.reduce((a, b) => a + b, 0), "total")
                        return formatNumber(total.toFixed(2))
                    })
                    return getTotal
                }
                function getTransportCost(result) {
                    console.log("getTransportCost", result)
                    let data = result.map(data => {
                        if (!data.transportCost) {
                            return 0.00
                        } else {
                            return data.transportCost
                        }
                    })
                    return data[0]
                }
                function getAdditionalCharges(result) {
                    let data = result.map(data => {
                        if (!data.additionalCharges) {
                            console.log(0)
                            return 0.00
                        } else {
                            const array = []
                            const totalArray = data.additionalCharges.map(data => {
                                let amount = Number(data.amount)
                                for (let i = 0; i < array.length; i++) {
                                    array[i] = amount
                                }
                                console.log(amount)
                                return amount
                            })
                            const sumOfArray = totalArray.reduce((partial_sum, a) => partial_sum + a, 0)
                            console.log(sumOfArray)
                            return sumOfArray
                        }
                    })
                    console.log("retunr data", data)
                    return data[0]
                }
                console.log(getAdditionalCharges(result))
                // console.log(getAdditionalCharges(result))
                function getSubTotalWithTransport(result) {
                    const getTotal = result.map(data => {
                        const quantities = data.products.map(data => {
                            //console.log("quantity", data.quantity)
                            return data.quantity
                        })
                        const discounts = data.products.map(data => {
                            //console.log("discount", data.discount)
                            return data.discount
                        })
                        const rates = data.products.map(data => {
                            //console.log("rate", data.sellingPrice)
                            return data.sellingPrice
                        })
                        let totalValue = []
                        for (let i = 0; i < Math.min(quantities.length); i++) {
                            let quantity = quantities[i]
                            let discount = discounts[i]
                            let rate = rates[i]
                            totalValue[i] = (quantity * rate) / 100 * (100 - discount);

                            //console.log(totalValue, "Total Value")
                        }

                        const total = totalValue.reduce((a, b) => (a + b))
                        const additionalCharges = getAdditionalCharges(result)
                        const subtotal = total + additionalCharges
                        //console.log(totalValue.reduce((a, b) => a + b, 0), "total")
                        return formatNumber(subtotal.toFixed(2))
                    })
                    return getTotal
                }
                //generate invoice table
                function generateInvoiceTable(doc, result) {

                    const productTable = result.map(data => {
                        let i,
                            invoiceTableTop = 305;
                        const productsInfo = data.productsList.map(data => {
                            return data
                        })
                        const productsDetails = data.products.map(data => {
                            return data
                        })
                        const additionalCharges = data.additionalCharges.map(data => {
                            return data
                        })
                        console.log("additionalCharges", additionalCharges)
                        generateTableRowTop(
                            doc,
                            invoiceTableTop,
                            "Code",
                            "Name",
                            "Quantity",
                            "Rate",
                            "Dis(%)",
                            "Dis Amount",
                            "Total"
                        );
                        generateHr(doc, invoiceTableTop + 20);
                        for (i = 0; i < productsInfo.length; i++) {
                            for (let index = 0; index < productsDetails.length; index++) {
                                const product = productsInfo[i];
                                const quantity = productsDetails[i]
                                const position = invoiceTableTop + (i + 1) * 30;
                                let totalValue = quantity.sellingPrice * quantity.quantity
                                let discount = (100 - quantity.discount) / 100
                                let discountValue = totalValue * discount
                                let discountAmount = totalValue - discountValue
                                let rate = quantity.sellingPrice
                                generateTableRow(
                                    doc,
                                    position,
                                    `FG${product.productCode}`,
                                    product.productName,
                                    product.baseUnitMeasure,
                                    quantity.quantity,
                                    rate,
                                    `${quantity.discount}%`,
                                    formatNumber(discountAmount.toFixed(2)),
                                    formatNumber(discountValue.toFixed(2))
                                );
                                generateHr(doc, position + 23);

                            }
                        }
                        const subtotalPosition = invoiceTableTop + (i + 1) * 30;

                        generateTableBottom(
                            doc,
                            subtotalPosition,
                            "",
                            "",
                            "",
                            "",
                            "",
                            "",
                            "Subtotal",
                            getSubTotal(result)
                        );
                        const transportcostposition = subtotalPosition + 15;
                        for (let i = 0; i < additionalCharges.length; i++) {
                            const info = additionalCharges[i]
                            console.log("reason", info.reason)
                            let amount = info.amount
                            console.log("amount", amount)
                            generateAdditionalCharges(
                                doc,
                                transportcostposition,
                                "",
                                "",
                                "",
                                "",
                                "",
                                "fuck",
                                info.reason,
                                amount
                            );

                        }

                        generateHrBottom(doc, transportcostposition + 10);
                        const totalcostposition = transportcostposition + 15;
                        generateTableBottom(
                            doc,
                            totalcostposition,
                            "",
                            "",
                            "",
                            "",
                            "",
                            "",
                            "Total",
                            getSubTotalWithTransport(result)
                        );
                        const position = totalcostposition + 5;
                        generateHrBottom(doc, position + 6);
                        generateHrBottom(doc, position + 8);
                    })
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
// Print Dispatch Note 
exports.print_dispatch_note = (req, res, next) => {
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
                    from: 'quotations',
                    localField: 'quotationNumber',
                    foreignField: 'id',
                    as: 'quotation'
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    let: { productId: "$products.id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$in": ["$id", "$$productId"] }
                            }
                        },
                        {
                            "$addFields": {
                                "sort": {
                                    "$indexOfArray": ["$$productId", "$id"]
                                }
                            }
                        },
                        { "$sort": { "sort": 1 } },
                        { "$addFields": { "sort": "$$REMOVE" } }
                    ],
                    as: 'productsList'
                }
            }]
    )
        .exec()
        .then(result => {
            const data = result
            if (result) {

                createInvoice(result, "./dispatchnote.pdf")
                //generate empty pdf
                function createInvoice(result, path) {
                    console.log(result.products)
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
                    generateCustomerInformation(doc, result)
                    generateInvoiceTable(doc, result);
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
                        doc.text(`Cheques to be written in favour of "Lifeguard Manufacturing (Pvt) Ltd"`, 50,
                            680,
                            { align: "center", width: 500 });
                        doc.text(`This is a system generated document. No sign required"`, 50,
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

                //generate customer information
                function generateCustomerInformation(doc, result) {
                    const results = result.map(data => {
                        const companyName = data.customer.map(customer => {
                            return customer.companyName
                        })
                        const mobileNo1 = data.customer.map(customer => {
                            return customer.mobileNo1
                        })
                        const email = data.customer.map(customer => {
                            return customer.email
                        })
                        const address = data.customer.map(address => {
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
                        const allDispatchNotes = data.dispatchNotes

                        const filteredDispatchNote = allDispatchNotes.filter(note => note.dispatchId == req.params.dispatchId);
                        const dispatchNote = filteredDispatchNote[0]
                        doc
                            .fillColor("#444444")
                            .fontSize(15)
                            .text("Dispatch Note", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`Invoice Number: ${data.invoiceNumber}`, 50, 200)
                            .text(`Invoice Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 215)
                            .text(`Dispatched Date: ${moment(dispatchNote.date).format('DD/MM/YYYY')}`, 50, 230)
                            .text(`Remarks: ${dispatchNote.remarks}`, 50, 245)
                            .text(`${companyName}`, 350, 200)
                            .font("Helvetica")
                            .text(`${no},${lane}`, 350, 215)
                            .text(`${city}, ${country}, ${postalCode}`, 350, 230)
                            .text(`${email}`, 350, 245)
                            .text(`${mobileNo1}`, 350, 260)
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
                function generateHrBottom(doc, y) {
                    doc
                        .strokeColor("#aaaaaa")
                        .lineWidth(1)
                        .moveTo(490, y)
                        .lineTo(550, y)
                        .stroke();
                }
                //generate table row
                function generateTableRow(doc, y, productCode, productName, uom, quantity, rate, discount, discountAmount, total) {
                    doc
                        .font("Helvetica")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 250 })
                        .text(quantity, 0, y, { align: "right" });
                }
                function generateTableRowTop(doc, y, productCode, productName, quantity, rate, discount, discountAmount, total) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(quantity, 0, y, { align: "right" });

                }
                function formatNumber(num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                }


                //generate invoice table
                function generateInvoiceTable(doc, result) {

                    const productTable = result.map(data => {
                        let i,
                            invoiceTableTop = 295;
                        const products = data.productsList.map(data => {
                            return data
                        })
                        const allDispatchNotes = data.dispatchNotes

                        const filteredDispatchNote = allDispatchNotes.filter(note => note.dispatchId == req.params.dispatchId);

                        const quantities = filteredDispatchNote.map(note => {
                            return note.data
                        })

                        const qu2 = quantities[0].map(quan => {
                            return quan
                        })
                        generateTableRowTop(
                            doc,
                            invoiceTableTop,
                            "Code",
                            "Product Name",
                            "Quantity"
                        );
                        generateHr(doc, invoiceTableTop + 20);
                        for (i = 0; i < products.length; i++) {
                            for (let index = 0; index < qu2.length; index++) {
                                const product = products[i];
                                const quantity = qu2[i]
                                const position = invoiceTableTop + (i + 1) * 30;

                                generateTableRow(
                                    doc,
                                    position,
                                    `FG${product.productCode}`,
                                    product.productName,
                                    product.baseUnitMeasure,
                                    quantity.quantity
                                );
                                generateHr(doc, position + 18);

                            }
                        }
                        const subtotalPosition = invoiceTableTop + (i + 1) * 23;

                        const position = invoiceTableTop + (i + 1) * 30;
                    })
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