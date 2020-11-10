const mongoose = require('mongoose')

const InvoicesSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    customerId: { type: String, require: true },
    userId: { type: String },    
    products: { type: Array }    
    
},
    {
        timestamps: true
    }
)
module.exports = Invoices = mongoose.model('Invoices', InvoicesSchema)