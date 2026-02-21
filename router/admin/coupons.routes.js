const express = require("express");
const router = express.Router();
const couponController = require("../../controller/admin/coupon.controller");
const adminAuth = require("../../middleware/auth");

router.get("/coupon", adminAuth.adminAuth, couponController.coupon);
router.post("/addCoupon", couponController.addCoupon);
router.patch("/editCoupon", couponController.editCoupon);
router.post("/removeCoupon", couponController.deletCoupon);

module.exports = router;
