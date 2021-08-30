const mongoose = require('mongoose')

const RawMaterialInventorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    grnNumber: { type: String, require: true },
    purchaseOrderId: { type: String, require: true },
    purchaseOrderNumber: { type: String, require: true },
    invoiceNumber: { type: String, require: true },
    invoiceDate: { type: String, require: true },
    rawMaterials: { type: Array },
    supplierId: { type: String },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = RawMaterialInventory = mongoose.model('RawMaterialInventory', RawMaterialInventorySchema)