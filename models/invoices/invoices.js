const mongoose = require('mongoose')

const InvoicesSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    customerId: { type: String, require: true },
    quotationNumber: { type: String },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    invoice_state: { type: String },
    disable_reason: { type: String },
    products: { type: Array },
    invoiceNumber: { type: String },
    advancePayment: { type: Number },
    paymentsAll: { type: Array },
    
},
    {
        timestamps: true
    }
)
module.exports = Invoices = mongoose.model('Invoices', InvoicesSchema)