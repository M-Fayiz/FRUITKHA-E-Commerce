const express = require('express')
const router = express.Router()
const reportController = require('../../controller/admin/salesReport.controller')
const adminAuth = require('../../middleware/auth')

router.get('/generoteReport', adminAuth.adminAuth, reportController.salesReport)
router.post('/get-sales-report', reportController.genorate)

module.exports = router
