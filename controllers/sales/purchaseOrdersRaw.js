const PurchaseOrdersRaw = require('../../models/purchaseOrders/purchaseOrdersRaw');
const Count = require('../../models/counter/count');
const mongoose = require('mongoose');
const _ = require('lodash');
const moment = require('moment');
const PDFDocument = require("pdfkit");
const multer = require('multer');

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
                console.log(year.toString() + month.toString() + (Math.random() * 100000).toFixed())
                //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
                return "POR" + year.toString() + month.toString() + doc.seq
            }
            const purchaseOrdersRaw = new PurchaseOrdersRaw({
                id: mongoose.Types.ObjectId(),
                supplierId: req.body.supplierId,
                userId: req.body.user.user.userId,
                userName: req.body.user.user.userName,
                userRole: req.body.user.user.userRole,
                rawMaterials: req.body.rawMaterials,
                order_state: "Pending",
                orderNumber: getOrderNumber()
            });
            purchaseOrdersRaw.save()
                .then(result => {
                    console.log(result);
                })
                .catch(err => console.log(err));
            res.status(200).json({
                //message: 'New Raw Material successfully created.',
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
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}
exports.purchase_orders_raw_get_one = (req, res, next) => {

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
                    localField: 'rawMaterials.id',
                    foreignField: 'id',
                    as: 'rawMaterialsList'
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
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    PurchaseOrdersRaw.update({ _id: req.params.id }, { $set: req.body })
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
    console.log("dates", startDate, " ", endDate)
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
                    localField: 'rawMaterials.id',
                    foreignField: 'id',
                    as: 'rawMaterialsList'
                }
            }
        ]
    )
        .then(result => {
            const data = result
            if (result) {
                console.log("doccccc", result)

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
                    console.log("ddddd", result)
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
                    console.log("dara")
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
                // function generateFooter(doc) {
                //     doc
                //         .fontSize(10)
                //         .text(
                //             "Payment is due within 15 days. Thank you for your business.",
                //             50,
                //             685,
                //             { align: "center", width: 500 }
                //         );
                // }
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
                            .text(`Credit Period: ${creditPeriod} Days`, 50, 230)
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
                function generateTableRow(doc, y, materialCodeRm, productName, uom, quantity) {

                    doc
                        .font("Courier-Bold")
                        .fontSize(9)
                        .text(materialCodeRm, 50, y)
                        .text(productName, 90, y)
                        .text(uom, 380, y, { width: 50, align: "right" })
                        .text(quantity, 470, y, { width: 50, align: "right" })
                }
                function generateTableRowTop(doc, y, productCode, productName, uom, quantity, rate, discount, total) {
                    doc
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y)
                        .text(productName, 90, y)
                        .text(uom, 380, y, { width: 50, align: "right" })
                        .text(quantity, 470, y, { width: 50, align: "right" })
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
                            "Quantity"
                        );
                        generateHr(doc, orderTableTop + 20);
                        doc.font("Helvetica")
                        for (i = 0; i < products.length; i++) {
                            for (let index = 0; index < quantities.length; index++) {
                                const product = products[i];
                                const quantity = quantities[i]
                                const position = orderTableTop + (i + 1) * 30;
                                generateTableRow(
                                    doc,
                                    position,
                                    `RM${product.materialCodeRm}`,
                                    product.materialName,
                                    quantity.uom,
                                    quantity.quantity
                                );
                                generateHr(doc, position + 20);
                            }
                        }

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