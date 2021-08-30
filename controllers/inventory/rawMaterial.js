const RawMaterialInventory = require('../../models/inventory/RawMaterialInventory');
const Count = require('../../models/counter/count');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require("fs");
const PDFDocument = require("pdfkit");
const RawMaterialMaster = require('../../models/master/RawMaterialMaster');
//Add new purchase order
exports.add_new_rawmaterial_inventory = (req, res, next) => {
    console.log(req)
    Count.findOneAndUpdate({ id: 'grnNumber' }, { $inc: { seq: 1 } }, { "new": true }, (error, doc) => {
        console.log("reqqqqqq", req.body.rawMaterials)
        if (doc) {
            //generate invoice number
            function grnNumber() {
                for (var i = 0; i < 5; i++)
                    var date = new Date()
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                //console.log("IN" + year.toString() + month.toString() + doc.seq)
                //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
                return "GRNR" + year.toString() + month.toString() + doc.seq
            }
            // RawMaterialMaster.find({ 'id': req.body.productId },
            //     function (err, docs) {

            // const productData = docs[0]
            // console.log("Product data", productData)
            const rawMaterialInventory = new RawMaterialInventory({
                id: mongoose.Types.ObjectId(),
                grnNumber: grnNumber(),
                purchaseOrderId: req.body.id,
                purchaseOrderNumber: req.body.orderNumber,
                invoiceNumber: req.body.invoiceNumber,
                invoiceDate: req.body.invoiceDate,
                rawMaterials: req.body.rawMaterials,
                supplierId: req.body.supplierId,
                userId: req.body.user.user.userId,
                userName: req.body.user.user.userName,
                userRole: req.body.user.user.userRole,

            });
            rawMaterialInventory.save()
                .then(result => {
                    console.log("raw material inventory save", result);
                })
                .catch(err => console.log(err));
            res.status(200).json({
                //message: 'New Raw Material successfully created.',
                rawMaterialInventory: rawMaterialInventory
            });
            //     }
            // )
        }
    })
}
//Get all invoices
exports.all_rawmaterial_inventory = (req, res, next) => {
    RawMaterialInventory.aggregate(
        [
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
                    as: 'productsDetails'
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
exports.grn_by_purchase_order = (req, res, next) => {
    console.log(req.params.id)
    RawMaterialInventory.aggregate(
        [
            {
                '$match': {
                    purchaseOrderId: req.params.id
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
                    as: 'materialDetails'
                }
            }

        ]
    )
        .exec()
        .then(doc => {
            if (doc) {
                console.log(doc)
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
//Get single GRN
exports.single_rawmaterial_inventory = (req, res, next) => {
    RawMaterialInventory.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
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
                    as: 'materialDetails'
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

exports.single_rawmaterial_inventory = (req, res, next) => {
    RawMaterialInventory.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
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
                    as: 'materialDetails'
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
//Print GRN
exports.print_grn_rawmaterial_inventory = (req, res, next) => {
    RawMaterialInventory.aggregate(
        [
            {
                '$match': {
                    id: req.params.id
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
                    as: 'materialDetails'
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

        ]
    )
        .exec()
        .then(result => {
            const data = result
            if (result) {
                console.log("result", result)
                createGrn(result, "./grn.pdf")
                //generate empty pdf
                function createGrn(result, path) {
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
                function generateSupplierInformation(doc, result) {
                    const results = result.map(data => {
                        console.log("Data",data)
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
                            .text("GRN RM", 50, 160);

                        generateHr(doc, 185);

                        doc
                            .fontSize(10)
                            .font("Helvetica-Bold")
                            .text(`GRN Number: ${data.grnNumber}`, 50, 200)
                            .text(`PO Number: ${data.purchaseOrderNumber}`, 50, 215)
                            .text(`Invoice Number: ${data.invoiceNumber}`, 50, 230)
                            .text(`GRN Date: ${moment(data.date).format('DD/MM/YYYY')}`, 50, 245)
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
                function generateHrBottom(doc, y) {
                    doc
                        .strokeColor("#aaaaaa")
                        .lineWidth(1)
                        .moveTo(490, y)
                        .lineTo(550, y)
                        .stroke();
                }
                //generate table row
                function generateTableRow(doc, y, productCode, productName, uom, quantity, rate, total) {
                    doc
                        .font("Courier-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 150 })
                        .text(uom, 300, y, { width: 60, align: "right" })
                        .text(rate, 350, y, { width: 60, align: "right" })
                        .text(quantity, 400, y, { width: 70, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function generateTableBottom(doc, y, productCode, productName, uom, quantity, rate, total) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(uom, 300, y, { width: 60, align: "right" })
                        .text(rate, 400, y, { width: 60, align: "right" })
                        .text(quantity, 450, y, { width: 70, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function generateTableRowTop(doc, y, productCode, productName, uom, quantity, rate, total) {
                    doc
                        .font("Helvetica-Bold")
                        .fontSize(9)
                        .text(productCode, 50, y, { width: 50 })
                        .text(productName, 90, y, { width: 180 })
                        .text(uom, 300, y, { width: 60, align: "right" })
                        .text(rate, 350, y, { width: 60, align: "right" })
                        .text(quantity, 400, y, { width: 70, align: "right" })
                        .text(total, 0, y, { align: "right" });
                }
                function formatNumber(num) {
                    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
                }
                function getSubTotal(result) {
                    console.log(result)
                    const getTotal = result.map(data => {
                        const quantities = data.rawMaterials.map(data => {
                            return data
                        })
                        let totalValue = []
                        for (let i = 0; i < Math.min(quantities.length); i++) {
                            let quantity = quantities[i]
                            totalValue[i] = Number(quantity.quantity) * Number(quantity.unitPrice)

                            //console.log(totalValue, "Total Value")
                        }

                        const total = totalValue.reduce((a, b) => (a + b))
                        //console.log(totalValue.reduce((a, b) => a + b, 0), "total")
                        return formatNumber(total.toFixed(2))
                    })
                    return getTotal
                }

               
                //generate invoice table
                function generateOrderTable(doc, result) {
                    
                    const productTable = result.map(data => {
                        //console.log("Products", data)
                        let i,
                            orderTableTop = 290;
                        const products = data.materialDetails.map(data => {
                            console.log("Products", data.baseUnitMeasure)
                            return data
                        })
              
                        const quantities = data.rawMaterials.map(data => {
                            console.log("Products2", data)
                            return data
                        })
                        doc.font("Helvetica")
                        generateTableRowTop(
                            doc,
                            orderTableTop,
                            "Code",
                            "Material Name",
                            "UOM",
                            "Unit Price",
                            "Quantity",
                            "Total"
                        );
                        generateHr(doc, orderTableTop + 20);
                        doc.font("Helvetica")
                        for (i = 0; i < products.length; i++) {
                            for (let index = 0; index < quantities.length; index++) {
                                const product = products[i];
                                const quantity = quantities[i]
                                const total = Number(quantity.unitPrice) * Number(quantity.quantity)
                                const unitPrice =Number( quantity.unitPrice)
                                const position = orderTableTop + (i + 1) * 30;
                                console.log(" product.baseUnitMeasure",product.baseUnitMeasure)
                                generateTableRow(
                                    doc,
                                    position,
                                    `RM${product.materialCodeRm}`,
                                    product.materialName,
                                    product.baseUnitMeasure,
                                    formatNumber(unitPrice.toFixed(2)),
                                    quantity.quantity,
                                    formatNumber(total.toFixed(2))
                                );
                                generateHr(doc, position + 20);
                            }
                        }
                        console.log(getSubTotal(result))
                        const position = orderTableTop + (i + 1) * 29;
                        generateTableBottom(
                            doc,
                            position,
                            "",
                            "",
                            "",
                            "",
                            "Subtotal",
                            getSubTotal(result)
                        )
                        generateHrBottom(doc, position + 10);
                        generateHrBottom(doc, position + 12);
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
//Search invoices
exports.search_rawmaterial_inventory = (req, res, next) => {
    console.log(req.body)
    const startDate = moment(req.body.formValues.startDate).format('MM/DD/YYYY')
    const endDate = moment(req.body.formValues.endDate).format('MM/DD/YYYY')
    FinishGoodInventory.aggregate(
        [
            {
                '$lookup': {
                    from: 'finishgoodsmasters',
                    localField: 'productId',
                    foreignField: 'id',
                    as: 'productDetails'
                }
            },
            {
                '$match': {
                    $or: [
                        { "productDetails.productName": req.body.formValues.searchText },
                        {
                            createdAt: {
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
