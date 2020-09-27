const mogoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDB = async () => {
    try {
        await mogoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('mongo connected')
    } catch (err) {
        console.err(err.message)
        process.exit(1)
    }
}

module.exports = connectDB;