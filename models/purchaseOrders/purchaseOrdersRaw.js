const mongoose = require('mongoose')

const PurchaseOrdersRawSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    supplierId: { type: String, require: true },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    order_state: { type: String },
    disable_reason: { type: String },
    orderNumber: { type: Number },
    rawMaterials: { type: Array }  
},
    {
        timestamps: true
    }
)
module.exports = PurchaseOrdersRaw = mongoose.model('PurchaseOrdersRaw', PurchaseOrdersRawSchema)