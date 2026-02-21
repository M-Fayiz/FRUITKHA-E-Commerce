const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/admin.controller");
const upload = require("../../utils/multer");
const adminAuth = require("../../middleware/auth");

router.post(
  "/addCategory",
  upload.single("image"),
  adminController.addCategory,
);
router.get("/category", adminAuth.adminAuth, adminController.LoadCategory);
router.post("/clear-offer", adminController.clearOffer);
router.patch("/categoryStatus", adminController.categoryStatus);
router.patch(
  "/EditCategory",
  upload.single("image"),
  adminController.EditCategory,
);

module.exports = router;
