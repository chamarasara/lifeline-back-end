const mongoose = require('mongoose')

const PurchaseOrdersPackingSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    supplierId: { type: String, require: true },
    userId: { type: String },
    userName: { type: String },
    packingMaterials: { type: Array }    
},
    {
        timestamps: true
    }
)
module.exports = PurchaseOrdersPacking = mongoose.model('PurchaseOrdersPacking', PurchaseOrdersPackingSchema)