const Quotations = require('../../models/quotation/quotation');
const mongoose = require('mongoose');
const moment = require('moment');
const fs = require("fs");
const PDFDocument = require("pdfkit");

//Add new quotations
exports.add_new_quotation = (req, res, next) => {
    //generate quotation number
    function getQuotationNumber() {
        for (var i = 0; i < 5; i++)
            var date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        console.log(year.toString() + month.toString() + (Math.random() * 100000).toFixed())
        //return (moment(Date.now()).format('YYYY/MM') + ((Math.random() * 100000).toFixed()))
        return year.toString() + month.toString()
    }
    console.log(req.body,"Quotations")
    const quotations = new Quotations({
        id: mongoose.Types.ObjectId(),
        productId: req.body.productId,
        price: req.body.price,
        discount: req.body.discount,
        quantity: req.body.quantity,
        quotation_state: "Pending",  
        // userId: req.body.user.user.userId,
        // userName: req.body.user.user.userName,
        // userRole: req.body.user.user.userRole,      
        quotationNumber: getQuotationNumber()
    });
    quotations.save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(200).json({
        //message: 'New Raw Material successfully created.',
        quotations: quotations
    });
}