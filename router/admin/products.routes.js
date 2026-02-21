const express = require("express");
const router = express.Router();
const productController = require("../../controller/ADMIN/product.controller");
const upload = require("../../utils/multer");
const adminAuth = require("../../middleware/auth");

router.get("/product", adminAuth.adminAuth, productController.productForm);

router.post(
  "/addProduct",
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
router.patch("/productList", productController.productList);
router.get(
  "/SingleImage/:id",
  adminAuth.adminAuth,
  productController.getProductDetails,
);

router.patch(
  "/updateProduct",
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
  productController.editProduct,
);

module.exports = router;
