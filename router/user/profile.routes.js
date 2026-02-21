const express = require("express");
const router = express.Router();
const profileController = require("../../controller/user/profile.controller");
const { USER_API } = require("../../constant/api/user.api");

router.get("/profile/:id", profileController.LoadProfile);
router.patch(USER_API.PROFILE, profileController.editProfile);
router.patch(USER_API.PROFILE_PASSWORD, profileController.ChangePass);

module.exports = router;
