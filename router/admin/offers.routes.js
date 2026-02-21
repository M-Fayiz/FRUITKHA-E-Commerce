const express = require("express");
const router = express.Router();
const offerController = require("../../controller/admin/offer.controller");
const adminAuth = require("../../middleware/auth");
const { OFFER_API } = require("../../constant/api/offer.api");

router.delete(OFFER_API.ITEM(":offerId"), (req, res, next) => {
  req.body.OfferID = req.params.offerId;
  return offerController.removeOFF(req, res, next);
});
router.post(OFFER_API.COLLECTION, offerController.addOffer);
router.get("/Offer", adminAuth.adminAuth, offerController.getOffer);

module.exports = router;
