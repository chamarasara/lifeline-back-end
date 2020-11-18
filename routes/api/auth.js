const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')

//Authentication, get user data
router.get('/', auth, async (req, res) => {
    try {
        const user = await (await User.findById(req.user.id)).isSelected('-password')
        res.json(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server Error')
    }
    res.send("Auth rote")
});

//user login
router.post('/login', [
    check('userName', 'Username required').not().isEmpty(),
    check('password', 'Password required').exists()
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        console.log(req.body)
        const { userName, password } = req.body
        try {
            //check user exists
            let user = await User.findOne({ userName })
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Access denied. Please enter valid username & password' }] })
            }
            //check correct username and password
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json(
                    { errors: [{ msg: 'Access denied. Please enter valid username & password' }] }
                )
            }
            const payload = {
                user: {
                    userId: user.id,
                    userName: user.userName,
                    userRole: user.userRole.userTypeName
                }
            }
            //return jwt token
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                (err, token) => {
                    if (err) throw err;
                    res.json({ token })
                }
            )
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    });
module.exports = router;