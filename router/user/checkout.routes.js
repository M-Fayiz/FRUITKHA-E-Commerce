const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const checkoutController = require("../../controller/user/check-out.controller");
const { ORDER_API } = require("../../constant/api/order.api");
const { PAYMENT_API } = require("../../constant/api/payment.api");

router.get(
  "/checkout",
  Auth.blockUser,
  Auth.sessionAuth,
  checkoutController.checkout,
);
router.post(ORDER_API.COLLECTION, checkoutController.placeOrder);
router.get("/success/:id", checkoutController.success);
router.get("/invoice/:id", checkoutController.invoice);

router.post(PAYMENT_API.CREATE_ORDER, checkoutController.razorPay);
router.post(PAYMENT_API.VERIFY, checkoutController.verifyPayment);
router.post(PAYMENT_API.RETRY, checkoutController.retryPayment);

module.exports = router;
