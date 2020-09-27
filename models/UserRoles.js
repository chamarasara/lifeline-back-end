const mongoose = require('mongoose')

const UserRolesSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    userTypeCode: { type: String, require: true },
    userTypeName: { type: String, require: true },
    permissions: {
        inventory: { type: Boolean, default: false },
        sales: { type: Boolean, default: false },
        production: { type: Boolean, default: false },
        quality: { type: Boolean, default: false },
        costing: { type: Boolean, default: false },
        accounting: { type: Boolean, default: false },
        hr: { type: Boolean, default: false},
        admin: { type: Boolean, default: false }
    }
})
module.exports = UserRoles = mongoose.model('UserRoles', UserRolesSchema)