const mongoose = require('mongoose')

const InvoicesSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    customerId: { type: String, require: true },
    userId: { type: String },
    invoice_state: { type: String },
    products: { type: Array },
    invoiceNumber: { type: Number },
    advancePayment: { type: Number },
    payments: { type: Array }
},
    {
        timestamps: true
    }
)
module.exports = Invoices = mongoose.model('Invoices', InvoicesSchema)