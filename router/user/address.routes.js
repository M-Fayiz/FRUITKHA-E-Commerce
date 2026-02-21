const express = require('express')
const router = express.Router()
const Auth = require('../../middleware/auth')
const addressController = require('../../controller/user/address.controller')

router.get('/address', Auth.blockUser, Auth.sessionAuth, addressController.address)
router.post('/addADRS', addressController.addAddres)
router.delete('/delete-Adres', addressController.rm_adres)
router.patch('/editADRS', addressController.editAdddres)

module.exports = router
