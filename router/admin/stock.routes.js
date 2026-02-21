const express = require("express");
const router = express.Router();
const stockController = require("../../controller/admin/stock.controller");
const adminAuth = require("../../middleware/auth");
const { PRODUCT_API } = require("../../constant/api/product.api");

router.get("/stock", adminAuth.adminAuth, stockController.stock);
router.post(PRODUCT_API.STOCK(":productId"), (req, res, next) => {
  req.body.productId = req.params.productId;
  return stockController.addQuantity(req, res, next);
});

module.exports = router;
