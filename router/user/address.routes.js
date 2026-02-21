const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const addressController = require("../../controller/user/address.controller");
const { ADDRESS_API } = require("../../constant/api/address.api");

router.get(
  "/address",
  Auth.blockUser,
  Auth.sessionAuth,
  addressController.address,
);
router.post(ADDRESS_API.COLLECTION, addressController.addAddres);
router.delete(ADDRESS_API.ITEM(), (req, res, next) => {
  req.body.adrsID = req.params.addressId;
  return addressController.rm_adres(req, res, next);
});
router.patch(ADDRESS_API.ITEM(), (req, res, next) => {
  req.body.user = req.params.addressId;
  return addressController.editAdddres(req, res, next);
});

module.exports = router;
