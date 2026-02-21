const express = require("express");
const router = express.Router();
const graphController = require("../../controller/admin/graph.controller");
const adminAuth = require("../../middleware/auth");
const { ANALYTICS_API } = require("../../constant/api/analytics.api");

router.post(ANALYTICS_API.SALES, adminAuth.adminAuth, graphController.graph);

module.exports = router;
