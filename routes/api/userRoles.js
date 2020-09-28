const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')

const UserRoles = require('../../models/UserRoles');

//New userRole
router.post('/new-user-role', [
    check('userTypeCode', 'User Type ID is required').exists(),
    check('userTypeName', 'User Type Name is required').exists(),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        console.log(req.body)
        const {
            userTypeCode, userTypeName, permissions: { inventory, sales, production, quality, costing, accounting, hr, admin }
        } = req.body
        try {
            userRoles = new UserRoles({
                userTypeCode,
                userTypeName,
                permissions: {
                    inventory,
                    sales,
                    production,
                    quality,
                    costing,
                    accounting,
                    hr,
                    admin
                }
            })
            //save user role
            await userRoles.save()
            res.send('New User Role Created')

        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    });

router.get('/all-user-roles', async (req, res) => {
    try {
        const userRoles = await UserRoles.find()
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
router.get('/single-user_role/:_id', async (req, res) => {
    try {
        id = req.params._id;
        const userRoles = await UserRoles.findById(id)
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