const mongoose = require('mongoose')

const PurchaseOrdersRawSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    supplierId: { type: String, require: true },
    userId: { type: String },
    userName: { type: String },
    rawMaterials: { type: Array }  
},
    {
        timestamps: true
    }
)
module.exports = PurchaseOrdersRaw = mongoose.model('PurchaseOrdersRaw', PurchaseOrdersRawSchema)