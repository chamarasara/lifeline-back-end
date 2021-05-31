const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const FinishGoodMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    productCode: { type: Number },
    productName: { type: String, require: true },
    productCategory: { type: String, require: true },
    baseUnitMeasure: { type: String, require: true },
    division: { type: String, require: true },
    productState: { type: String },
    unitsInPack: { type: Number },
    profitCenter: { type: String },
    minimumSellingUnits: { type: Number },    
    barCode: { type: Number },
    barCodeImage: { type: String },
    artWorkNumber: { type: String },
    productDescription: { type: String },
    sellingPrice: { type: Number },
    factoryPrice: { type: Number },
    distributorMargin: { type: Number },
    retailerMargin: { type: Number },
    freeIssues: { type: Number },
    maximumDiscount: { type: Number },
    distributors: { type: Array },
    shelfLife: { type: String },
    perfumeCode: { type: String },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    type: { type: String }
},
    {
        timestamps: true
    }
)

FinishGoodMasterSchema.plugin(AutoIncrement, { inc_field: 'productCode', inc_amount: '1' });

module.exports = FinishGoodsMaster = mongoose.model('FinishGoodsMaster', FinishGoodMasterSchema)