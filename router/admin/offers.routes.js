const express = require('express')
const router = express.Router()
const offerController = require('../../controller/admin/offer.controller')
const adminAuth = require('../../middleware/auth')

router.post('/clearOffer', offerController.removeOFF)
router.post('/addOffer', offerController.addOffer)
router.get('/Offer', adminAuth.adminAuth, offerController.getOffer)

module.exports = router
