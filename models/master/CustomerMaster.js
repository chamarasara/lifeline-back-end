const mongoose = require('mongoose')

const CustomerMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    customerName: { type: String, require: true },
    mobileNo: { type: String, require: true },
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
    debitPeriod: { type: String }

})
module.exports = CustomerMaster = mongoose.model('CustomerMaster', CustomerMasterSchema)