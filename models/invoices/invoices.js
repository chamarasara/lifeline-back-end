const mongoose = require('mongoose')

const InvoicesSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    customerId: { type: String, require: true },
    quotationNumber: { type: String },
    remarks: { type: String },
    reference: { type: String, default: "-" },
    transportCost: { type: Number, default: 0 },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    invoice_state: { type: String },
    disable_reason: { type: String },
    products: { type: Array },
    dispatchNotes: [{}],
    invoiceNumber: { type: String },
    advancePayment: { type: Number },
    paymentsAll: { type: Array },
    haveReturns: { type: Boolean, default: false }

},
    {
        timestamps: true
    }
)
module.exports = Invoices = mongoose.model('Invoices', InvoicesSchema)