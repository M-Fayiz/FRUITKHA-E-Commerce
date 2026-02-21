const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/admin.controller");
const upload = require("../../utils/multer");
const adminAuth = require("../../middleware/auth");
const { CATEGORY_API } = require("../../constant/api/category.api");

router.post(
  CATEGORY_API.COLLECTION,
  upload.single("image"),
  adminController.addCategory,
);
router.get("/category", adminAuth.adminAuth, adminController.LoadCategory);
router.post(CATEGORY_API.CLEAR_OFFER, adminController.clearOffer);
router.patch(CATEGORY_API.STATUS(":itemId"), (req, res, next) => {
  req.body.itemId = req.params.itemId;
  return adminController.categoryStatus(req, res, next);
});
router.patch(
  CATEGORY_API.ITEM(":productId"),
  upload.single("image"),
  (req, res, next) => {
    req.body.productId = req.params.productId;
    return adminController.EditCategory(req, res, next);
  },
);

module.exports = router;
