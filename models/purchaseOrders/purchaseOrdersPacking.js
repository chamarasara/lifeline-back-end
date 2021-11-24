const mongoose = require('mongoose')

const PurchaseOrdersPackingSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    supplierId: { type: String, require: true },
    order_state: { type: String },
    disable_reason: { type: String },
    orderNumber: { type: String },
    packingMaterials: { type: Array },
    grnDetails: [{}],
    bankPaymentsDetails: [{}],
    cashPaymentsDetails: [{}],
    additionalChargesChequePayments: [{}],
    additionalChargesCashPayments: [{}],
    returnsDetails: [{}],
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
},
    {
        timestamps: true
    }
)
module.exports = PurchaseOrdersPacking = mongoose.model('PurchaseOrdersPacking', PurchaseOrdersPackingSchema)