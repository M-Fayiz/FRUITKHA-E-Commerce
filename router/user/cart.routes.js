const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const cartController = require("../../controller/user/cart.controller");
const { CART_API } = require("../../constant/api/cart.api");

router.get("/cart", Auth.blockUser, Auth.sessionAuth, cartController.cart);
router.post(CART_API.ITEMS, cartController.addCart);
router.patch(CART_API.ITEM(), (req, res, next) => {
  req.body.productId = req.params.productId;
  return cartController.updateCART(req, res, next);
});
router.delete(CART_API.ITEM(), (req, res, next) => {
  req.body.productId = req.params.productId;
  return cartController.removeCart(req, res, next);
});

module.exports = router;
