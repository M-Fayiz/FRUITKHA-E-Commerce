const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const wishlistController = require("../../controller/user/wishList.controller");
const { WISHLIST_API } = require("../../constant/api/wishlist.api");

router.get(
  "/wishList",
  Auth.blockUser,
  Auth.sessionAuth,
  wishlistController.wishList,
);
router.post(WISHLIST_API.TOGGLE, wishlistController.toggleWishList);
router.delete(WISHLIST_API.ITEM(), (req, res, next) => {
  req.body.item = req.params.itemId;
  return wishlistController.remove_wishList(req, res, next);
});

module.exports = router;
