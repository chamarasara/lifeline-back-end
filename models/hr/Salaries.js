const mongoose = require('mongoose')

const SalariesShema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    referanceNumber: { type: String },
    employeeId: { type: String },
    month: { type: String },
    overTimeHours: { type: Number, default: 0 },
    overTimeRate: { type: Number, default: 0 },
    loanRecovery: { type: Number, default: 0 },
    stampDuty: { type: Number, default: 0 },
    noPay: { type: Number, default: 0 },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = Salaries = mongoose.model('Salaries', SalariesShema)