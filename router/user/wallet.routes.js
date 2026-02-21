const express = require('express')
const router = express.Router()
const walletController = require('../../controller/user/wallet.controller')

router.get('/wallet', walletController.wallet)

module.exports = router
