const mongoose = require('mongoose')

const EmployeeMasterShema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    employeeNumber: { type: String },
    status: { type: String },
    employeeName: { type: String },
    idNumber: { type: String },
    otherIdNumber: { type: String },
    birthDay: { type: String },
    contactNumber: { type: Number },
    guardianNumber: { type: Number },
    email: { type: String },
    permenantAddress: { type: String },
    temporaryAddress: { type: String },
    companyName: { type: String },
    designation: { type: String },
    joinedDate: { type: String },
    probationPeriod: { type: String },
    dateOfConfirmation: { type: String },
    employeeStatus: { type: String },
    epfNumber: { type: String },
    etfNumber: { type: String },
    insuarancePolicyNumber: { type: String },
    basicSalary: { type: Number, default: 0 },
    vehicleAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    uniformCost: { type: Number, default: 0 },
    insuaranceCost: { type: Number, default: 0 },
    telephoneAllowance: { type: Number, default: 0 },
    fuelAllowance: { type: Number, default: 0 },
    foodAllowance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    epfCompany: { type: Number, default: 0 },
    epfEmployee: { type: Number, default: 0 },
    etfEmployee: { type: Number, default: 0 },
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
},
    {
        timestamps: true
    }
)
module.exports = EmployeeMaster = mongoose.model('EmployeeMaster', EmployeeMasterShema)