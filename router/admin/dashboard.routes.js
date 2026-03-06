const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin_temp/admin.controller");
const adminAuth = require("../../middleware/auth");

router.get("/", adminAuth.adminAuth, adminController.LoadHome);

module.exports = router;
