const express = require("express");
const router = express.Router();
const couponController = require("../../controller/admin_temp/coupon.controller");
const { CART_API } = require("../../constant/api/cart.api");

router.post(CART_API.COUPON, couponController.couponValidate);
router.delete(CART_API.COUPON, couponController.remove);

module.exports = router;
