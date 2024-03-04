const express = require("express");
const router = express.Router();

const apiController = require("../app/controllers/ApiController");

router.post("/storeSpecification", apiController.storeSpecification);
router.get("/createWarranty", apiController.createWarranty);
router.post("/storeWarranty", apiController.storeWarranty);

module.exports = router;
