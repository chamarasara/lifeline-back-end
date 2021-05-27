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
    attendanceAllowance: { type: Number, default: 0 },
    basicSalary: { type: Number, default: 0 },
    vehicleAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    uniformCost: { type: Number, default: 0 },
    insuaranceCost: { type: Number, default: 0 },
    telephoneAllowance: { type: Number, default: 0 },
    fuelAllowance: { type: Number, default: 0 },
    foodAllowance: { type: Number, default: 0 },
    accommodationAllowance: { type: Number, default: 0 },
    accomodationEmployee: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    epfCompany: { type: Number, default: 0 },
    epfEmployee: { type: Number, default: 0 },
    etfEmployee: { type: Number, default: 0 },
    stampDuty: { type: Number, default: 0 },
    salaryAdvance: { type: Number, default: 0 },
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