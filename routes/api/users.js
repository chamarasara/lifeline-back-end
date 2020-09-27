const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const User = require('../../models/User')
//New user
router.post('/newuser', [
    check('userName', 'Username required').not().isEmpty(),
    check('email', 'Email invalid').isEmail(),
    check('password', 'Please enter password with 6 or more characters').isLength({ min: 6 })
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        console.log(req.body)
        const {
            firstName, lastName, mobileNo, nic, email, birthDay, gender, userName, password, userRole,
            address: { city, country, lane, no, postalCode }
        } = req.body
        try {

            //check user exists
            let user = await User.findOne({ userName })
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists!' }] })
            }
            //get user gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                firstName,
                lastName,
                mobileNo,
                nic,
                email,
                birthDay,
                gender,
                userName,
                password,
                userRole,
                address: { city, country, lane, no, postalCode }
            })
            //encrypt password
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            await user.save()
            res.send('User registerd')
            //return jwt token
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    });

module.exports = router;