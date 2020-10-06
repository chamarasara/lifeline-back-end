const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const UserRoles = require('../../models/UserRoles');

//New userRole
router.post('/new-user-role', auth, [
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

router.get('/all-user-roles', auth, async (req, res) => {
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
//update user role
router.patch('/update-user-role/:_id', auth, async (req, res) => {
    try {
       
            id = req.params._id;
            console.log(req.body)
            const updateOps = {};

            for (const ops in req.body) {
                updateOps[ops.propName] = ops.value;
            }

        UserRoles.update({ _id: id }, { $set: req.body })
                .exec()
                .then(result => {
                    UserRoles.findById(id)
                        .then(docs => {
                            console.log("docs****", docs)
                            res.status(200).json(docs);
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(500).json({
                                error: err
                            });
                        });
                })
       

    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})
//Delete user role
router.delete('/delete-user-role/:_id', auth, async (req, res) => {
    try {
        id = req.params._id;
        const userRoles = await UserRoles.remove({ _id: id })
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