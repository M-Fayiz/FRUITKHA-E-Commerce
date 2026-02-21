const express = require("express");
const router = express.Router();
const profileController = require("../../controller/user/profile.controller");

router.get("/rest", profileController.rest);
router.post("/forgot-Password", profileController.forgotPAS);
router.get("/rest-Password", profileController.newpass);
router.post("/rest-Password", profileController.REST);

module.exports = router;
