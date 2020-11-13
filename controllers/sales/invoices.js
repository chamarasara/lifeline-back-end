const Invoices = require('../../models/invoices/invoices');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require("fs");
const PDFDocument = require("pdfkit");
const blobStream = require('blob-stream');

//Add new purchase order
exports.add_new_invoice = (req, res, next) => {
    console.log(req.body)
    const invoices = new Invoices({
        id: mongoose.Types.ObjectId(),
        customerId: req.body.customerId,
        userId: req.body.userId,
        products: req.body.products,
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
//Get all raw materials
exports.all_invoices = (req, res, next) => {
    Invoices.aggregate(
        [{
            '$lookup': {
                from: 'customermasters',
                localField: 'customerId',
                foreignField: 'id',
                as: 'customer'
            }
        },
        {
            '$lookup': {
                from: 'productmasters',
                localField: 'products.id',
                foreignField: 'id',
                as: 'productsList'
            }
        }]
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
                    from: 'customermasters',
                    localField: 'customerId',
                    foreignField: 'id',
                    as: 'customer'
                }
            },
            {
                '$lookup': {
                    from: 'productmasters',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'productsList'
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
//Delete raw material
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
    Invoices.aggregate(
        [
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
                    from: 'productmasters',
                    localField: 'products.id',
                    foreignField: 'id',
                    as: 'searchProducts'
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


// Print Invoice
exports.print_invoice = (req, res, next) => {
    // var file = fs.createReadStream('./output.pdf');
    // var stat = fs.statSync('./output.pdf');
    // res.setHeader('Content-Length', stat.size);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
    // file.pipe(res);


    console.log(req.params.id)
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
                    from: 'productmasters',
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
                    let doc = new PDFDocument({ bufferPages: true });
                    // console.log(doc)
                    //generateHeader(doc);
                    // generateCustomerInformation(doc, result);
                    // generateInvoiceTable(doc, result);
                    // generateFooter(doc);
                    //doc.image('../../public/assets/img/logo.jpg', 50, 45, { width: 50 })
                    // doc.pipe(fs.createWriteStream(path.substr(1)));
                    // doc.end();
                    let buffers = [];
                    doc.on('data', buffers.push.bind(buffers));
                    doc.on('end', () => {

                        let pdfData = Buffer.concat(buffers);
                        res.writeHead(200, {
                            'Content-Length': Buffer.byteLength(pdfData),
                            'Content-Type': 'application/pdf',
                            'Content-disposition': 'attachment;filename=test.pdf',
                        })
                            .end(pdfData);

                    });
                    // doc.image('logo.jpg', { width: 150, height: 150 })
                    generateHeader(doc)
                    generateFooter(doc)
                    //generateCustomerInformation(doc, result)
                    //doc.pipe(res)
                    //console.log(res)
                    doc.end();

                }
                //generate pdf header
                function generateHeader(doc) {
                    doc
                        .image('controllers/sales/logo.png', 50, 45, { width: 70 })
                        .fillColor("#444444")
                        .fontSize(18)
                        .text("Lifeguard Manufactoring (pvt)Ltd.", 140, 80)
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
                            680,
                            { align: "center", width: 500 }
                        );
                }
                //generate customer information
                function generateCustomerInformation(doc, result) {
                    const array = result;
                    const results = array.map(data => ({
                        id: data.id, text: data._id
                    }))
                    console.log(results)
                    const customerDetails = result.customer
                    doc
                        .text(`Invoice Number: ${results.id}`, 50, 200)
                        .text(`Invoice Date: ${moment(results.date).format('MM/DD/YYYY')}`, 50, 215)
                        //.text(`Balance Due: ${result.subtotal - result.paid}`, 50, 130)

                        .text(customerDetails.companyName, 300, 200)
                        .text(`${customerDetails.registerAddress.no2},${customerDetails.registerAddress.lane}`, 300, 215)
                        .text(`${customerDetails.city}, ${customerDetails.country}, ${customerDetails.postalCode}`, 300, 130)
                        .moveDown();
                }
                //generate table row
                function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
                    doc
                        .fontSize(10)
                        .text(c1, 50, y)
                        .text(c2, 150, y)
                        .text(c3, 280, y, { width: 90, align: "right" })
                        .text(c4, 370, y, { width: 90, align: "right" })
                        .text(c5, 0, y, { align: "right" });
                }
                //generate invoice table
                function generateInvoiceTable(doc, result) {
                    let i,
                        invoiceTableTop = 330;
                    const products = result.productsList
                    const quantities = result.products

                    for (i = 0; i < products.length; i++) {
                        for (let index = 0; index < quantities.length; index++) {
                            const product = products[i];
                            const quantity = quantities[i]
                            const position = invoiceTableTop + (i + 1) * 30;
                            generateTableRow(
                                doc,
                                position,
                                product.productCode,
                                product.productName,
                                quantity.uom,
                                quantity.quantity,
                                quantity.uom * quantity.quantity
                            );
                        }
                    }
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