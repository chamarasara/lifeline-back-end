const mongoose = require('mongoose')

const ReturnInvoiceSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    returnInvoiceNumber: { type: String },
    invoiceId: { type: String },
    invoiceNumber: { type: String },
    customerId: { type: String, require: true },
    products: { type: Array },
    reason: { type: String },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = ReturnInvoice = mongoose.model('ReturnInvoice', ReturnInvoiceSchema)