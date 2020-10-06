const jwt = require('jsonwebtoken')
const config = require('config')


module.exports = function (req, res, next) {
    //get the token from the header
    const token = req.header('Authorization');

    //check if not token
    if (!token) {
        return res.status(401).json({ msg: 'Access denied, please login using your correct Username & Password'})
    }

    //verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user;
        next()
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid'})
    }
}