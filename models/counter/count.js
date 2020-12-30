const mongoose = require('mongoose')


const CountSchema = new mongoose.Schema({
    id: { type: String, require: true },
    seq: { type: Number },
    tt: { type: String }
},
    {
        timestamps: true
    }
)


module.exports = Count = mongoose.model('Count', CountSchema)