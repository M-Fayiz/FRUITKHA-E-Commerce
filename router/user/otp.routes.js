const express = require('express')
const router = express.Router()
const userController = require('../../controller/user/user.controller')

router.post('/genarateOTP', userController.generateOTP)
router.get('/getOTP', userController.Loadotp)
router.post('/resendOTP', userController.resendOTP)
router.post('/verifyOTP', userController.verifyOTP)

module.exports = router
