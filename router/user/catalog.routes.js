const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const userController = require("../../controller/user/user.controller");

router.get("/", Auth.blockUser, userController.LoadHome);
router.get("/about", Auth.blockUser, userController.about);
router.get("/contact", Auth.blockUser, userController.contact);
router.get("/shop", Auth.blockUser, userController.shop);
router.get("/product/:id", userController.productId);
router.get("/search", userController.search);
router.get("/ALL", userController.ALL);

module.exports = router;
