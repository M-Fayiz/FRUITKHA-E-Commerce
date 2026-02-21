const express = require("express");
const router = express.Router();

router.use(require("./user/auth.routes"));
router.use(require("./user/otp.routes"));
router.use(require("./user/password.routes"));
router.use(require("./user/profile.routes"));
router.use(require("./user/address.routes"));
router.use(require("./user/catalog.routes"));
router.use(require("./user/cart.routes"));
router.use(require("./user/checkout.routes"));
router.use(require("./user/orders.routes"));
router.use(require("./user/wishlist.routes"));
router.use(require("./user/coupons.routes"));
router.use(require("./user/wallet.routes"));

module.exports = router;
