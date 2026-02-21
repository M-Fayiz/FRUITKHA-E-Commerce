const express = require('express')
const router = express.Router()
const adminController = require('../../controller/admin/admin.controller')

router.get('/login', adminController.LoadLogin)
router.post('/verify_login', adminController.verifyLogin)

module.exports = router
