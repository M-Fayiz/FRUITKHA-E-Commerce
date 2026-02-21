const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const upload = require("../../utils/multer");
const userOrderController = require("../../controller/user/userOrder.controller");
const adminOrderController = require("../../controller/admin/order.controller");

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

router.post("/cancel-order", adminOrderController.handleProductAction);
router.post("/order-cancel", userOrderController.CANCELallORDER);

router.post(
  "/return-Order",
  upload.single("prodctImage"),
  userOrderController.ReturnOrder,
);
router.post(
  "/req-return",
  upload.single("productImage"),
  userOrderController.productReturn,
);

module.exports = router;
