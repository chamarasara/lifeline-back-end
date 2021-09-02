const mongoose = require('mongoose')

const PurchaseOrdersRawSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    supplierId: { type: String, require: true },
    order_state: { type: String },
    disable_reason: { type: String },
    orderNumber: { type: String },
    rawMaterials: { type: Array },
    grnDetails: [{}],
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = PurchaseOrdersRaw = mongoose.model('PurchaseOrdersRaw', PurchaseOrdersRawSchema)