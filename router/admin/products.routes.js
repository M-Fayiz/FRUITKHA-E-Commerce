const express = require("express");
const router = express.Router();
const productController = require("../../controller/admin_temp/product.controller");
const upload = require("../../utils/multer");
const adminAuth = require("../../middleware/auth");
const { PRODUCT_API } = require("../../constant/api/product.api");

router.get("/product", adminAuth.adminAuth, productController.productForm);

router.post(
  PRODUCT_API.COLLECTION,
  (req, res, next) => {
    upload.array("primaryImageInput", 3)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  productController.addProduct,
);

router.get("/productList", adminAuth.adminAuth, productController.prductList);
router.patch(PRODUCT_API.STATUS(":itemId"), (req, res, next) => {
  req.body.itemId = req.params.itemId;
  return productController.productList(req, res, next);
});
router.get(
  "/SingleImage/:id",
  adminAuth.adminAuth,
  productController.getProductDetails,
);

router.patch(
  PRODUCT_API.ITEM(":productId"),
  (req, res, next) => {
    upload.fields([
      { name: "primaryImage", maxCount: 1 },
      { name: "additionalImage0", maxCount: 1 },
      { name: "additionalImage1", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  (req, res, next) => {
    req.body.productId = req.params.productId;
    return productController.editProduct(req, res, next);
  },
);

module.exports = router;
