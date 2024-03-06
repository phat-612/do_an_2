const express = require("express");
const router = express.Router();

const apiController = require("../app/controllers/ApiController");
router.post("/storeCategory", apiController.storeCategory);
router.post("/storeWarranty", apiController.sWarranty);

module.exports = router;
