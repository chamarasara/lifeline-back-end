const Invoices = require('../../models/invoices/invoices');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require("fs");
const PDFDocument = require("pdfkit");

//Add new purchase order
exports.add_new_invoice = (req, res, next) => {
    //generate invoice number
    function getInvoiceNumber() {
        for (var i = 0; i < 5; i++)
            var date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        console.log(year.toString() + month.toString() + (Math.random() * 100000).toFixed())
        //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
        return year.toString() + month.toString() + (Math.random() * 100000).toFixed()
    }
    const invoices = new Invoices({
        id: mongoose.Types.ObjectId(),
        customerId: req.body.customerId,
        quotationNumber: req.body.quotationNumber,
        userId: req.body.user.user.userId,
        userName: req.body.user.user.userName,
        userRole: req.body.user.user.userRole,
        invoice_state: "enabled",
        invoiceNumber: getInvoiceNumber()
    });
    invoices.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        invoices: invoices
    });
}
//Get all invoices
exports.all_invoices = (req, res, next) => {
    Invoices.aggregate(
        [
            {
                '$lookup': {
                    from: 'quotations',
                    localField: 'quotationNumber',
                    foreignField: 'quotationNumber',
                    as: 'quotationDetails'
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'quotationDetails.products.id',
                    foreignField: 'id',
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
                    from: 'quotations',
                    localField: 'quotationNumber',
                    foreignField: 'quotationNumber',
                    as: 'quotationDetails'
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'quotationDetails.products.id',
                    foreignField: 'id',
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
            }]
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

//Update raw material
exports.update_invoice = (req, res, next) => {

    const id = req.params.id;
    console.log(id)
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
    console.log(req.body)
    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    Invoices.aggregate(
        [
            {
                '$lookup': {
                    from: 'quotations',
                    localField: 'quotationNumber',
                    foreignField: 'quotationNumber',
                    as: 'quotationDetails'
                }
            },
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'quotationDetails.products.id',
                    foreignField: 'id',
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
                '$match': {
                    $or: [
                        { "searchProducts.productName": req.body.formValues.searchText },
                        { "searchCustomer.customerName": req.body.formValues.searchText },
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
                    from: 'finishgoodsmasters',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'productsList'
                }
            }]
    )
        .exec()
        .then(result => {
            const data = result
            if (result) {
                console.log("doccccc", result)

                createInvoice(result, "./invoice.pdf")
                //generate empty pdf
                function createInvoice(result, path) {
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
                        doc.fontSize(8)
                        doc.text(`Page ${i + 1} of ${range.count}`, 50,
                            710,
                            { align: "center", width: 500 });
                    }
                    //set userName 
                    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
                        doc.switchToPage(i);
                        doc.text(`Invoice Created By: ${result[0].userName}`, 50,
                            700,
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
                        .text("Lifeguard Manufacturing (Pvt)Ltd.", 155, 80)
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
                        const mobileNo = data.customer.map(customer => {
                            return customer.mobileNo
                        })
                        const email = data.customer.map(customer => {
                            return customer.email
                        })
                        const address = data.customer.map(address => {
                            return address.registerAddress
                        })
                        const no = address.map(no => {
                            return no.no2
                        })
                        const lane = address.map(lane => {
                            return lane.lane2
                        })
                        const city = address.map(city => {
                            return city.city2
                        })
                        const country = address.map(country => {
                            return country.country2
                        })
                        const postalCode = address.map(postalCode => {
                            return postalCode.postalCode2
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
                            .text(`Invoice Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 215)
                            .text(`Total Value: ${getSubTotal(result)}${getCurrency(result)}`, 50, 230)
                            .text(`Created By: ${data.userName}`, 50, 245)
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
                function generateTableRow(doc, y, productCode, productName, uom, quantity, rate, total) {
                    doc
                        .font("Helvetica")
                        .fontSize(10)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 150, y, { width: 150 })
                        .text(uom, 280, y, { width: 40, align: "right" })
                        .text(quantity, 370, y, { width: 50, align: "right" })
                        .text(rate, 420, y, { width: 50, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function getSubTotal(result) {

                    const getTotal = result.map(data => {
                        const quantities = data.products.map(data => {
                            return data.quantity * data.rate
                        })
                        const total = quantities.reduce((a, b) => (a + b))
                        return total
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
                            invoiceTableTop = 330;
                        const products = data.productsList.map(data => {
                            return data
                        })
                        const quantities = data.products.map(data => {
                            return data
                        })
                        doc.font("Helvetica-Bold")
                        generateTableRow(
                            doc,
                            invoiceTableTop,
                            "Code",
                            "Name",
                            "UOM",
                            "Quantity",
                            "Rate",
                            "Total"
                        );
                        generateHr(doc, invoiceTableTop + 20);
                        doc.font("Helvetica")
                        for (i = 0; i < products.length; i++) {
                            for (let index = 0; index < quantities.length; index++) {
                                const product = products[i];
                                const quantity = quantities[i]
                                const position = invoiceTableTop + (i + 1) * 30;
                                generateTableRow(
                                    doc,
                                    position,
                                    `FG${product.productCode}`,
                                    product.productName,
                                    quantity.uom,
                                    quantity.quantity,
                                    quantity.rate,
                                    quantity.rate * quantity.quantity
                                );
                                generateHr(doc, position + 23);
                            }
                        }
                        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
                        generateTableRow(
                            doc,
                            subtotalPosition,
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