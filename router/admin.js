const express = require('express')
const router = express.Router()

router.use(require('./admin/auth.routes'))
router.use(require('./admin/dashboard.routes'))
router.use(require('./admin/users.routes'))
router.use(require('./admin/categories.routes'))
router.use(require('./admin/products.routes'))
router.use(require('./admin/offers.routes'))
router.use(require('./admin/orders.routes'))
router.use(require('./admin/stock.routes'))
router.use(require('./admin/coupons.routes'))
router.use(require('./admin/reports.routes'))
router.use(require('./admin/graph.routes'))

module.exports = router
