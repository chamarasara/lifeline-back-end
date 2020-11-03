const mongoose = require('mongoose')

const ProductMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String },
    productName: { type: String },
    productCode: { type: String },
    productUom: { type: String },
    sellingPrice: { type: Number },
    directCost: { type: Number },
    inDirectCost: { type: Number },
    profitMargin: { type: Number },
    distributorMargin: { type: Number },
    retailerMargin: { type: Number },
    userId: { type: String }
},
    {
        timestamps: true
    }
)

module.exports = ProductMaster = mongoose.model('ProductMaster', ProductMasterSchema)