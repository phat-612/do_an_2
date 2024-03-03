const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/SiteController");
router.get("/:slug", siteController.createWarranty);

module.exports = router;
