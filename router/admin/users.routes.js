const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/admin.controller");
const adminAuth = require("../../middleware/auth");

router.get("/userList", adminAuth.adminAuth, adminController.Load_User);
router.patch("/toogleUserStatus", adminController.toogleUserStatus);

module.exports = router;
