const mongoose = require('mongoose')

const SupplierMasterSchema = new mongoose.Schema({
    id: { type: String, require: true },
    date: { type: Date, default: Date.now },
    supplierName: { type: String, require: true },
    mobileNo1: { type: String, require: true },
    mobileNo2: { type: String, require: true },
    fax: { type: String, require: true },
    registerNo: { type: String, require: true },
    email: { type: String, require: true },
    companyName: { type: String, require: true },
    communicationAddress: {
        city: { type: String },
        country: { type: String },
        lane: { type: String },
        no: { type: String },
        postalCode: { type: String }
    },
    registerAddress: {
        city2: { type: String },
        country2: { type: String },
        lane2: { type: String },
        no2: { type: String },
        postalCode2: { type: String }
    },
    state: { type: String },
    currency: { type: String },
    creditPeriod: { type: Number },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = SupplierMaster = mongoose.model('SupplierMaster', SupplierMasterSchema)