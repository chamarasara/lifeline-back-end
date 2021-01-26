const mongoose = require('mongoose')

const FinishGoodInventorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    productId: { type: String, require: true },
    quantity: { type: String },
    batchNumber: { type: String },
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