const PurchaseOrdersPacking = require('../../models/purchaseOrders/purchaseOrdersPacking');
const mongoose = require('mongoose');
const _ = require('lodash');
const PDFDocument = require("pdfkit");
const moment = require('moment');
//const Supplier = require('../../models/master/SupplierMaster');
//Add new purchase order
exports.purchase_order_packing_add_new = (req, res, next) => {
    //generate order number
    function getOrderNumber() {
        for (var i = 0; i < 5; i++)
            var date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        console.log(year.toString() + month.toString() + (Math.random() * 100000).toFixed())
        //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
        return year.toString() + month.toString() + (Math.random() * 100000).toFixed()
    }
    const purchaseOrdersPacking = new PurchaseOrdersPacking({
        id: mongoose.Types.ObjectId(),
        supplierId: req.body.supplierId,
        userId: req.body.userId,
        userName: req.body.user.user.userName,
        userRole: req.body.user.user.userRole,
        order_state: "Pending",
        orderNumber: getOrderNumber(),
        packingMaterials: req.body.packingMaterials
    });
    purchaseOrdersPacking.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        purchaseOrdersPacking: purchaseOrdersPacking
    });
}
//Get all raw materials
exports.purchase_orders_packing_get_all = (req, res, next) => {
    //PurchaseOrders.find()
    PurchaseOrdersPacking.aggregate(
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
                from: 'packingmaterialmasters',
                localField: 'packingMaterials.id',
                foreignField: 'id',
                as: 'packingMaterialsList'
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
exports.purchase_orders_packing_get_one = (req, res, next) => {

    //PurchaseOrders.findById(req.params._id)
    PurchaseOrdersPacking.aggregate(
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
                    from: 'packingmaterialmasters',
                    localField: 'packingMaterials.id',
                    foreignField: 'id',
                    as: 'packingMaterialsList'
                }
            }]
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
exports.update_purchase_order_packing = (req, res, next) => {

    const id = req.params.id;
    const updateOps = {};
    for (const ops in req.body) {
        updateOps[ops.propName] = ops.value;
    }

    PurchaseOrdersPacking.update({ _id: req.params.id }, { $set: req.body })
        .exec()
        .then(result => {
            PurchaseOrdersPacking.findById(id)
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
exports.delete_purchase_order_packing = (req, res, next) => {
    const id = req.params.id;
    PurchaseOrdersPacking.remove({ _id: id })
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
exports.search_purchase_orders_packing = (req, res, next) => {
    const startDate = moment(req.body.formValues.startDate).format('YYYY/MM/DD')
    const endDate = moment(req.body.formValues.endDate).format('YYYY/MM/DD')
    console.log("dates", startDate, " ", endDate)
    PurchaseOrdersPacking.aggregate(
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
                    from: 'packingmaterialmasters',
                    localField: 'packingMaterials.id',
                    foreignField: 'id',
                    as: 'searchPackingMaterial'
                }
            },
            {
                '$match': {
                    $or: [
                        { "searchPackingMaterial.materialName": req.body.formValues.searchText },
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
//Print purchase order
exports.print_purchase_orders_packing = (req, res, next) => {

    //PurchaseOrders.findById(req.params._id)
    PurchaseOrdersPacking.aggregate(
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
                    from: 'packingmaterialmasters',
                    localField: 'packingMaterials.id',
                    foreignField: 'id',
                    as: 'packingMaterialsList'
                }
            }]
    )
        .exec()
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
                        doc.text(`Purchase Order Created By: ${result[0].userName}`, 50,
                            700,
                            { align: "center", width: 500 });
                    }
                    // manually flush pages that have been buffered
                    doc.flushPages();
                    //doc.pipe(res)
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
                //generate customer information
                function generateSupplierInformation(doc, result) {
                    const results = result.map(data => {
                        const companyName = data.supplier.map(supplier => {
                            return supplier.companyName
                        })
                        const mobileNo = data.supplier.map(supplier => {
                            return supplier.mobileNo
                        })
                        const email = data.supplier.map(supplier => {
                            return supplier.email
                        })
                        const address = data.supplier.map(address => {
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
                            .text("Purchase Order PM", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`Order Number: ${data.orderNumber}`, 50, 200)
                            .text(`Order Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 215)
                            //.text(`Total Value: ${getSubTotal(result)}${getCurrency(result)}`, 50, 230)
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
                function generateTableRow(doc, y, productCode, productName, uom, quantity) {

                    doc
                        .font("Helvetica")
                        .fontSize(10)
                        .text(productCode, 50, y)
                        .text(productName, 200, y)
                        .text(uom, 320, y, { width: 50, align: "right" })
                        .text(quantity, 470, y, { width: 50, align: "right" })
                }
                // function getSubTotal(result) {

                //     const getTotal = result.map(data => {
                //         const quantities = data.products.map(data => {
                //             return data.quantity * data.rate
                //         })
                //         const total = quantities.reduce((a, b) => (a + b))
                //         return total
                //     })
                //     return getTotal
                // }
                // function getCurrency(result) {

                //     const getCurrency = result.map(data => {
                //         const currency = data.products[0]
                //         return currency.currency
                //     })
                //     return getCurrency
                // }

                //generate invoice table
                function generateOrderTable(doc, result) {

                    const productTable = result.map(data => {

                        let i,
                            orderTableTop = 330;
                        const products = data.packingMaterialsList.map(data => {
                            return data
                        })

                        const quantities = data.packingMaterials.map(data => {
                            return data
                        })
                        doc.font("Helvetica-Bold")
                        generateTableRow(
                            doc,
                            orderTableTop,
                            "Material Code",
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
                                    product.materialCode,
                                    product.materialName,
                                    quantity.uom,
                                    quantity.quantity
                                );
                                generateHr(doc, position + 20);
                            }
                        }
                        const subtotalPosition = orderTableTop + (i + 1) * 30;
                        generateTableRow(
                            doc,
                            subtotalPosition,
                            "",
                            "",
                            "",

                            //getSubTotal(result)
                        );

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