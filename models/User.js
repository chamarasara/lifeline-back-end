const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now},
    avatar: { type: String },
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    mobileNo: { type: String, require: true },
    nic: { type: String, require: true },
    email: { type: String, require: true },
    birthDay: { type: String, require: true },
    gender: { type: String, require: true },
    userName: { type: String, require: true },
    password: { type: String, require: true },
    avatar: { type: String },
    address : {
        city: { type: String, require: true },
        country: { type: String, require: true },
        lane: { type: String, require: true },
        no: { type: String, require: true },
        postalCode: { type: String, require: true }
    },
    userRole:{
        id:{type:String, require:true},
        userTypeCode: { type: String, require: true } ,
        userTypeName: { type: String, require: true }
    },
    superAdmin: { type: Boolean, default: false }
})
module.exports = User = mongoose.model('Users', UserSchema)