const mongoose = require('mongoose')

const CustomerMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String },
    customerName: { type: String, require: true },
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
    state: { type: String },
    currency: { type: String },
    creditPeriod: { type: Number },
    creditAmount: { type: Number },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = CustomerMaster = mongoose.model('CustomerMaster', CustomerMasterSchema)