const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin_temp/admin.controller");
const { AUTH_API } = require("../../constant/api/auth.api");

router.get("/login", adminController.LoadLogin);
router.post(AUTH_API.ADMIN_LOGIN, adminController.verifyLogin);

module.exports = router;
