const ReturnInvoices = require('../../models/invoices/ReturnInvoice');
const Count = require('../../models/counter/count');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require("fs");
const PDFDocument = require("pdfkit");

//Add new purchase order
exports.add_new_returnInvoice = (req, res, next) => {

    Count.findOneAndUpdate({ id: 'returnInvoiceNo' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {

        if (doc) {
            //generate invoice number
            function getInvoiceNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                //console.log("IN" + year.toString() + month.toString() + doc.seq)
                //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
                return "RIN" + year.toString() + month.toString() + doc.seq
            }
            console.log("req", req.body)
            const returnInvoices = new ReturnInvoices({
                id: mongoose.Types.ObjectId(),
                returnInvoiceNumber: getInvoiceNumber(),
                invoiceId: req.body.id,
                invoiceNumber: req.body.invoiceNumber,
                customerId: req.body.customerId,
                products: req.body.products,
                reason: req.body.reason,
                userId: req.body.user.user.userId,
                userName: req.body.user.user.userName,
                userRole: req.body.user.user.userRole
            });

            returnInvoices.save()
                .then(result => {
                    //console.log(result);
                })
                .catch(err => console.log(err));
            res.status(200).json({
                //message: 'New Raw Material successfully created.',
                returnInvoices: returnInvoices
            });
        }
    })
}
//Get all invoices
exports.all_return_invoices = (req, res, next) => {
    ReturnInvoices.aggregate(
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
                    from: 'invoices',
                    localField: 'invoiceId',
                    foreignField: 'id',
                    as: 'invoiceDetails'
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
exports.single_return_invoice = (req, res, next) => {
    //console.log("req", req.params.id)
    ReturnInvoices.aggregate(
        [
            {
                '$match': {
                    invoiceId: req.params.id
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
                    from: 'customermasters',
                    localField: 'customerId',
                    foreignField: 'id',
                    as: 'customer'
                }
            },
            {
                '$lookup': {
                    from: 'invoices',
                    localField: 'invoiceId',
                    foreignField: 'id',
                    as: 'invoiceDetails'
                }
            }
        ]
    )
        .exec()
        .then(doc => {
            if (doc) {
                console.log("doc", doc)
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
exports.update_return_invoice = (req, res, next) => {
    console.log(req.body)
    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    ReturnInvoices.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            ReturnInvoices.findById(id)
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
//Delete invoice
exports.delete_return_invoice = (req, res, next) => {
    const id = req.params.id;
    ReturnInvoices.remove({ _id: id })
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
exports.search_return_invoices = (req, res, next) => {

    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    ReturnInvoices.aggregate(
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
                from: 'invoices',
                localField: 'invoiceId',
                foreignField: 'id',
                as: 'invoiceDetails'
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


// Print Return Invoice
exports.print_return_invoice = (req, res, next) => {
    ReturnInvoices.aggregate(
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
                    from: 'invoices',
                    localField: 'invoiceId',
                    foreignField: 'id',
                    as: 'invoiceDetails'
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

                createInvoice(result, "./return-invoice.pdf")
                //generate empty pdf
                function createInvoice(result, path) {
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
                        doc.text(`This is system generate document. No sign required"`, 50,
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

                        const creditPeriod = data.customer.map(creditPeriod => {
                            //console.log("credit period", creditPeriod.creditPeriod)
                            return creditPeriod.creditPeriod
                        })
                        const invoice = data.invoiceDetails.map(invoice => {
                            return invoice
                        })
                        const invoiceDate = invoice.map(invoiceDate => {
                            return invoiceDate.date
                        })

                        doc
                            .fillColor("#444444")
                            .fontSize(15)
                            .text("Return Invoice", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`Return Invoice Number: ${data.returnInvoiceNumber}`, 50, 200)
                            .text(`Invoice Number: ${data.invoiceNumber}`, 50, 215)
                            .text(`Invoice Date: ${moment(invoiceDate[0]).format('DD/MM/YYYY')}`, 50, 230)
                            .text(`Return Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 245)
                            .text(`Reason: ${data.reason}`, 50, 260)
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
                //generate table row
                function generateTableRow(doc, y, productCode, productName, uom, quantity, rate, discount, total) {
                    doc
                        .font("Helvetica")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(uom, 270, y, { width: 40, align: "right" })
                        .text(quantity, 300, y, { width: 60, align: "right" })
                        .text(rate, 350, y, { width: 50, align: "right" })
                        .text(discount, 400, y, { width: 50, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function generateTableRowTop(doc, y, productCode, productName, uom, quantity, rate, discount, total) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(uom, 270, y, { width: 40, align: "right" })
                        .text(quantity, 300, y, { width: 60, align: "right" })
                        .text(rate, 350, y, { width: 50, align: "right" })
                        .text(discount, 400, y, { width: 50, align: "right" })
                        .font("Helvetica-Bold")
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
                        const rates = data.productsList.map(data => {
                            //console.log("rate", data.sellingPrice)
                            return data.sellingPrice
                        })
                        let totalValue = []
                        for (let i = 0; i < Math.min(quantities.length, rates.length, discounts.length); i++) {
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
                function getCurrency(result) {

                    const getCurrency = result.map(data => {
                        const currency = data.products[0]
                        return currency.currency
                    })
                    return getCurrency
                }

                //generate invoice table
                function generateInvoiceTable(doc, result) {

                    const productTable = result.map(data => {
                        let i,
                            invoiceTableTop = 305;
                        const products = data.productsList.map(data => {
                            return data
                        })
                        const quantities = data.products.map(data => {
                            return data
                        })
                        doc.font("Helvetica-Bold")
                        generateTableRowTop(
                            doc,
                            invoiceTableTop,
                            "Code",
                            "Name",
                            "UOM",
                            "Quantity",
                            "Rate",
                            "Discount",
                            "Total"
                        );
                        generateHr(doc, invoiceTableTop + 20);
                        for (i = 0; i < products.length; i++) {
                            for (let index = 0; index < quantities.length; index++) {
                                const product = products[i];
                                const quantity = quantities[i]
                                const position = invoiceTableTop + (i + 1) * 30;
                                let totalValue = product.sellingPrice * quantity.quantity
                                let discount = (100 - quantity.discount) / 100
                                let discountValue = totalValue * discount
                                let rate = product.sellingPrice
                                generateTableRow(
                                    doc,
                                    position,
                                    `FG${product.productCode}`,
                                    product.productName,
                                    product.baseUnitMeasure,
                                    quantity.quantity,
                                    rate,
                                    `${quantity.discount}%`,
                                    formatNumber(discountValue.toFixed(2))
                                );
                                generateHr(doc, position + 23);

                            }
                        }
                        const subtotalPosition = invoiceTableTop + (i + 1) * 31;
                        doc.font("Helvetica-Bold")
                        generateTableRow(
                            doc,
                            subtotalPosition,
                            "",
                            "",
                            "",
                            "",
                            "",
                            "Subtotal",
                            getSubTotal(result)
                        );
                        const position = invoiceTableTop + (i + 1) * 30;
                        generateHr(doc, position + 20);
                        generateHr(doc, position + 22);
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