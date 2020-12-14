const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const BomGoodMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    bomName: { type: String, require: true },
    rawMaterials: { type: Array },
    packingMaterials: { type: Array },
    bomCode: { type: Number },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)

BomGoodMasterSchema.plugin(AutoIncrement, { inc_field: 'bomCode', inc_amount: '1' });

module.exports = BomMaster = mongoose.model('BomMaster', BomGoodMasterSchema)