const express = require("express");
const router = express.Router();
const orderController = require("../../controller/admin/order.controller");
const adminAuth = require("../../middleware/auth");
const { ORDER_API } = require("../../constant/api/order.api");

router.get("/order", adminAuth.adminAuth, orderController.order);
router.get("/order-details/:id", orderController.details);
router.patch(ORDER_API.STATUS(":orderId"), (req, res, next) => {
  req.body.OrderID = req.params.orderId;
  return orderController.OrderStatus(req, res, next);
});
router.post(ORDER_API.RETURN_RESPONSE, orderController.ReturnHandle);
router.post(ORDER_API.RETURN_PRODUCT_RESPONSE, orderController.ReturnHandle);

module.exports = router;
