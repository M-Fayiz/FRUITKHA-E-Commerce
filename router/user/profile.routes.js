const express = require("express");
const router = express.Router();
const profileController = require("../../controller/user/profile.controller");

router.get("/profile/:id", profileController.LoadProfile);
router.patch("/editProfile", profileController.editProfile);
router.patch("/change-Password", profileController.ChangePass);

module.exports = router;
