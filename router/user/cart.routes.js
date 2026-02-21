const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const cartController = require("../../controller/user/cart.controller");

router.get("/cart", Auth.blockUser, Auth.sessionAuth, cartController.cart);
router.post("/addCart", cartController.addCart);
router.post("/update-quantity", cartController.updateCART);
router.post("/removeCart", cartController.removeCart);

module.exports = router;
