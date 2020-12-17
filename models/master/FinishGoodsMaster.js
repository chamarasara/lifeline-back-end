const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const FinishGoodMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    productName: { type: String, require: true },
    productCategory: { type: String, require: true },
    baseUnitMeasure: { type: String, require: true },
    division: { type: String, require: true },
    productState: { type: String },
    barCode: { type: Number },
    barCodeImage: { type: String },
    productDescription: { type: String },
    sellingPrice: { type: String },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String },
    productCode: { type: Number },
    type: { type: String }
},
    {
        timestamps: true
    }
)

FinishGoodMasterSchema.plugin(AutoIncrement, { inc_field: 'productCode', inc_amount: '1' });

module.exports = FinishGoodsMaster = mongoose.model('FinishGoodsMaster', FinishGoodMasterSchema)