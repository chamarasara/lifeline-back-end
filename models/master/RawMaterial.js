const mongoose = require('mongoose')

const RawMaterialSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    materialName: { type: String, require: true },
    materialCode: { type: String, require: true },
    materialGroup: { type: String, require: true },
    baseUnitMeasure: { type: String, require: true },
    oldMaterialNumber: { type: String, require: true },
    division: { type: String, require: true },
    suppliers: { 
        supplier1: { type: String},
        supplier2: { type: String },
        supplier3: { type: String },
        supplier4: { type: String },
        supplier5: { type: String },
        supplier6: { type: String },
        supplier7: { type: String },
        supplier8: { type: String },
        supplier9: { type: String },
        supplier10: { type: String }
     },    
    
})
module.exports = RawMaterial = mongoose.model('RawMaterial', RawMaterialSchema)