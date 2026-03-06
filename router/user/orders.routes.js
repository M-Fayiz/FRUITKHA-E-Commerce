const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const upload = require("../../utils/multer");
const userOrderController = require("../../controller/user/userOrder.controller");
const adminOrderController = require("../../controller/admin_temp/order.controller");
const { ORDER_API } = require("../../constant/api/order.api");

router.get(
  "/orderList",
  Auth.blockUser,
  Auth.sessionAuth,
  userOrderController.orderList,
);
router.get(
  "/orderDetails/:id",
  Auth.sessionAuth,
  userOrderController.orderDetails,
);

router.post(ORDER_API.CANCEL_ITEM(), (req, res, next) => {
  req.body.orderId = req.params.orderId;
  req.body.productId = req.params.productId;
  return adminOrderController.handleProductAction(req, res, next);
});
router.post(ORDER_API.CANCEL(), (req, res, next) => {
  req.body.orderId = req.params.orderId;
  return userOrderController.CANCELallORDER(req, res, next);
});

router.post(
  ORDER_API.RETURN_ORDER(),
  upload.single("prodctImage"),
  (req, res, next) => {
    req.body.orderId = req.params.orderId;
    return userOrderController.ReturnOrder(req, res, next);
  },
);
router.post(
  ORDER_API.RETURN_ITEM(),
  upload.single("productImage"),
  (req, res, next) => {
    req.body.orderId = req.params.orderId;
    req.body.productId = req.params.productId;
    return userOrderController.productReturn(req, res, next);
  },
);

module.exports = router;
