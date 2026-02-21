const express = require('express')
const router = express.Router()
const orderController = require('../../controller/admin/order.controller')
const adminAuth = require('../../middleware/auth')

router.get('/order', adminAuth.adminAuth, orderController.order)
router.get('/order-details/:id', orderController.details)
router.put('/OrderStatus', orderController.OrderStatus)
router.post('/response', orderController.ReturnHandle)
router.post('/productRes', orderController.ReturnHandle)

module.exports = router
