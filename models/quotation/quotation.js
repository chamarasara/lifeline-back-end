const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const QuotationsSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    customerId: { type: String, require: true },
    products: { type: Array },
    quotation_state: { type: String },
    disable_reason: { type: String },
    quotationNumber: { type: String },
    userId: { type: String, require: true },
    userName: { type: String, require: true },
    userRole: { type: String, require: true },
},
    {
        timestamps: true
    }
)

//QuotationsSchema.plugin(AutoIncrement, { inc_field: 'quotationNumber2', inc_amount: '1' });

module.exports = Quotations = mongoose.model('Quotations', QuotationsSchema)