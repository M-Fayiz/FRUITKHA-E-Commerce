const express = require("express");
const router = express.Router();
const graphController = require("../../controller/admin/graph.controller");
const adminAuth = require("../../middleware/auth");

router.post("/graph", adminAuth.adminAuth, graphController.graph);

module.exports = router;
