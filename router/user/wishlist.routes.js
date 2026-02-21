const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const wishlistController = require("../../controller/user/wishList.controller");

router.get(
  "/wishList",
  Auth.blockUser,
  Auth.sessionAuth,
  wishlistController.wishList,
);
router.post("/toggleWishList", wishlistController.toggleWishList);
router.post("/remove-wishList", wishlistController.remove_wishList);

module.exports = router;
