const express = require("express");
const router = express.Router();

const apiController = require("../app/controllers/ApiController");
router.post("/storeSpecification", apiController.storeSpecification);
module.exports = router;
