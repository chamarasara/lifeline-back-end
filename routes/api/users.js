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
        const {
            firstName, lastName, mobileNo, nic, email, birthDay, gender, userName, password,
            address: { city, country, lane, no, postalCode }, userRole: { id, userTypeCode, userTypeName}
        } = req.body
        console.log(req.body.userRole)
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
                avatar,
                firstName,
                lastName,
                mobileNo,
                nic,
                email,
                birthDay,
                gender,
                userName,
                password,
                address: { city, country, lane, no, postalCode },
                userRole: { id, userTypeCode, userTypeName }
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

//get all user
router.get('/all-users', async (req, res) => {
    try {
        const user = await User.find()
            .exec()
            .then(docs => {
                console.log(docs);
                res.status(200).json(docs);
            })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})
//get single user
router.get('/single-user/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const user = await User.findById(id)
            .exec()
            .then(docs => {
                console.log(docs);
                res.status(200).json(docs);
            })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})
module.exports = router;