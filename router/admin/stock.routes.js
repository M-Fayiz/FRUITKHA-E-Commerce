const express = require("express");
const router = express.Router();
const stockController = require("../../controller/admin/stock.controller");
const adminAuth = require("../../middleware/auth");

router.get("/stock", adminAuth.adminAuth, stockController.stock);
router.post("/addStock", stockController.addQuantity);

module.exports = router;
