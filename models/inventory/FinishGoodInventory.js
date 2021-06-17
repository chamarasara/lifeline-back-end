const mongoose = require('mongoose')

const FinishGoodInventorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    productId: { type: String, require: true },
    sellingPrice: { type: Number, require: true },
    quantity: { type: Number },
    remainingQuantity: { type: Number },
    issuedItems: [Array],
    batchNumber: { type: String },
    manufacturingDate: { type: String },
    reasonForDelay: { type: String },
    expiryDate: { type: String },
    shelfLife: { type: Number },
    finishGoodDescription: { type: String },
    refNumberFgInventory: { type: String },
    finishGoodState: { type: String, default: "Active" },
    reviseReason: { type: String },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = FinishGoodInventory = mongoose.model('FinishGoodInventory', FinishGoodInventorySchema)