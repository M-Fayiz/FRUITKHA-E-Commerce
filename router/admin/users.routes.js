const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin_temp/admin.controller");
const adminAuth = require("../../middleware/auth");
const { USER_API } = require("../../constant/api/user.api");

router.get("/userList", adminAuth.adminAuth, adminController.Load_User);
router.patch(USER_API.STATUS(), (req, res, next) => {
  req.body.userId = req.params.userId;
  return adminController.toogleUserStatus(req, res, next);
});

module.exports = router;
