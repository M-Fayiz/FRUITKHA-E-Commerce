const express = require("express");
const router = express.Router();
const couponController = require("../../controller/admin/coupon.controller");
const adminAuth = require("../../middleware/auth");
const { COUPON_API } = require("../../constant/api/coupon.api");

router.get("/coupon", adminAuth.adminAuth, couponController.coupon);
router.post(COUPON_API.COLLECTION, couponController.addCoupon);
router.patch(COUPON_API.ITEM(":couponId"), (req, res, next) => {
  req.body.id = req.params.couponId;
  return couponController.editCoupon(req, res, next);
});
router.delete(COUPON_API.ITEM(":couponId"), (req, res, next) => {
  req.body.couponId = req.params.couponId;
  return couponController.deletCoupon(req, res, next);
});

module.exports = router;
