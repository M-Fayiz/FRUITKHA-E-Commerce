const express = require('express')
const router = express.Router()
const Auth = require('../../middleware/auth')
const checkoutController = require('../../controller/user/check-out.controller')

router.get('/checkout', Auth.blockUser, Auth.sessionAuth, checkoutController.checkout)
router.post('/placeOrder', checkoutController.placeOrder)
router.get('/success/:id', checkoutController.success)
router.get('/invoice/:id', checkoutController.invoice)

router.post('/create-order', checkoutController.razorPay)
router.post('/verify-payment', checkoutController.verifyPayment)
router.post('/retry-payment', checkoutController.retryPayment)

module.exports = router
