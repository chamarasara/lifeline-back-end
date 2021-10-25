const mongoose = require('mongoose')

const BankAccountsMasterSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    bankName: { type: String, require: true },
    accountName: { type: String, require: true },
    accountNumber: { type: String, require: true },
    branch: { type: String, require: true },
    accountType: { type: String, require: true },
    currency: { type: String, require: true },
    accountStatus: { type: String, require: true },
    profitCenter: { type: String, require: true },
    deleted: { type: String, default: false },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)



module.exports = BankAccountsMaster = mongoose.model('BankAccountsMaster', BankAccountsMasterSchema)