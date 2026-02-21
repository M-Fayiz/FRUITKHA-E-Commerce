const express = require('express')
const router = express.Router()
const couponController = require('../../controller/admin/coupon.controller')

router.post('/couponDetails', couponController.couponValidate)
router.post('/remove-coupon', couponController.remove)

module.exports = router
