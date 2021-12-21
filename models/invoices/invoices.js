const mongoose = require('mongoose')

const InvoicesSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    invoiceNumber: { type: String },
    customerId: { type: String, require: true },
    quotationNumber: { type: String },
    products: { type: Array },
    remarks: { type: String },
    reference: { type: String, default: "-" },
    invoice_state: { type: String },
    disable_reason: { type: String },
    dispatchNotes: [{}],
    advancePayment: { type: Number },
    haveReturns: { type: Boolean, default: false },
    additionalCharges: [{}],
    bankPaymentsDetails: [{}],
    cashPaymentsDetails: [{}],
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },

},
    {
        timestamps: true
    }
)
module.exports = Invoices = mongoose.model('Invoices', InvoicesSchema)