const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const QuotationsSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    id: { type: String, require: true },
    productId: { type: String, require: true },
    price: { type: Number, require: true },
    discount: { type: Number, require: true },
    quantity: { type: Number, require: true },
    quotation_state: { type: String },
    quotationNumber: { type: Number },
    quotationNumber2: { type: Number },
    //quotationNumber3: { type: Number, default: 'quotationNumber' + 'quotationNumber2' },
    userId: { type: String, require: true },
    userName: { type: String, require: true },
    userRole: { type: String, require: true },
},
    {
        timestamps: true
    }
)

QuotationsSchema.plugin(AutoIncrement, { inc_field: 'quotationNumber', inc_amount: '1' });

module.exports = Quotations = mongoose.model('Quotations', QuotationsSchema)